import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Header } from './Header';

const auth = vi.hoisted(() => ({ user: null as { id: number; email: string; role: 'CUSTOMER' | 'ADMIN' } | null }));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: auth.user, isAdmin: auth.user?.role === 'ADMIN', logout: vi.fn() }) }));

describe('Header role navigation', () => {
  it('hides Admin for customers and displays it for admins', () => {
    auth.user = { id: 1, email: 'customer@example.com', role: 'CUSTOMER' };
    const { rerender } = render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();

    auth.user = { id: 2, email: 'admin@example.com', role: 'ADMIN' };
    rerender(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });
});
