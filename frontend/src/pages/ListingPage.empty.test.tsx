import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ListingPage } from './ListingPage';

vi.mock('../api/vehicles', () => ({ listVehicles: vi.fn(), getFilters: vi.fn() }));
import { getFilters, listVehicles } from '../api/vehicles';

describe('ListingPage empty state', () => {
  it('offers to clear filters when there are no matching cars', async () => {
    vi.mocked(listVehicles).mockResolvedValue({ items: [], total: 0, page: 1, limit: 12 });
    vi.mocked(getFilters).mockResolvedValue({ makes: [], models: [], categories: [], fuelTypes: [], transmissions: [], price: { min: 0, max: 0 }, year: { min: 0, max: 0 } });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><MemoryRouter><ListingPage /></MemoryRouter></QueryClientProvider>);
    expect(await screen.findByRole('heading', { name: 'No cars match your filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});
