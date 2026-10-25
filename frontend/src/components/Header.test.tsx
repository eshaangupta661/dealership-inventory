import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { Header } from './Header';

describe('Header', () => {
  it('renders the AutoHub logo and anonymous navigation', () => {
    render(<BrowserRouter><AuthProvider><Header /></AuthProvider></BrowserRouter>);

    expect(screen.getByRole('link', { name: 'AutoHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });
});
