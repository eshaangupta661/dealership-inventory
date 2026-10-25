import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const auth = vi.hoisted(() => ({ user: null as { id: number; email: string; role: 'CUSTOMER' | 'ADMIN' } | null }));
vi.mock('./auth/AuthContext', () => ({ useAuth: () => ({ user: auth.user, isAdmin: auth.user?.role === 'ADMIN', loading: false }) }));
import { RequireAdmin } from './App';

function renderGuard() {
  return render(<MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<RequireAdmin><p>Admin content</p></RequireAdmin>} /><Route path="/login" element={<p>Login destination</p>} /><Route path="/" element={<p>Home destination</p>} /></Routes></MemoryRouter>);
}

describe('RequireAdmin', () => {
  it('blocks anonymous visitors and customers', () => {
    auth.user = null;
    const { unmount } = renderGuard();
    expect(screen.getByText('Login destination')).toBeInTheDocument();
    unmount();

    auth.user = { id: 1, email: 'customer@example.com', role: 'CUSTOMER' };
    renderGuard();
    expect(screen.getByText('Home destination')).toBeInTheDocument();
  });
});
