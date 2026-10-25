import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { afterEach, vi } from 'vitest';
import { apiClient, resetSessionExpiryNotification } from '../api/client';
import { AuthProvider } from './AuthContext';

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

function ProtectedRequests() {
  useEffect(() => {
    const timer = window.setTimeout(() => { void Promise.allSettled([apiClient('/protected-one'), apiClient('/protected-two')]); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <p>Protected page</p>;
}

afterEach(() => {
  localStorage.clear();
  resetSessionExpiryNotification();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('session expiry', () => {
  it('logs out and redirects once when parallel authenticated requests return 401', async () => {
    localStorage.setItem('token', 'expired-token');
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/auth/me')) return new Response(JSON.stringify({ id: 1, email: 'user@example.com', role: 'CUSTOMER' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }));

    render(<MemoryRouter initialEntries={['/private']}><AuthProvider><Routes><Route path="/private" element={<ProtectedRequests />} /><Route path="/login" element={<p>Login destination</p>} /></Routes></AuthProvider></MemoryRouter>);

    expect(await screen.findByText('Login destination')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Session expired, please log in again');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
