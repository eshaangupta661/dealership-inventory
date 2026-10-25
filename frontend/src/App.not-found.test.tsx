import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';

describe('unknown routes', () => {
  it('shows the not-found page', () => {
    render(<MemoryRouter initialEntries={['/missing-page']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to listings' })).toHaveAttribute('href', '/');
  });
});
