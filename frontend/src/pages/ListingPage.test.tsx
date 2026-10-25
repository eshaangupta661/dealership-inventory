import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ListingPage } from './ListingPage';
import type { Vehicle } from '../api/types';

vi.mock('../api/vehicles', () => ({
  listVehicles: vi.fn(),
  getFilters: vi.fn(),
}));

import { getFilters, listVehicles } from '../api/vehicles';

const vehicle: Vehicle = {
  id: 1,
  make: 'Maruti Suzuki',
  model: 'Swift',
  variant: 'Sportz',
  category: 'Hatchback',
  fuelType: 'PETROL',
  transmission: 'MANUAL',
  condition: 'NEW',
  year: 2026,
  kmDriven: 0,
  ownerCount: 1,
  price: 699000,
  quantity: 1,
  color: 'Blue',
  imageUrl: null,
  createdAt: '2026-10-25T00:00:00.000Z',
  updatedAt: '2026-10-25T00:00:00.000Z',
};

describe('ListingPage', () => {
  it('renders vehicle cards from the API response', async () => {
    vi.mocked(listVehicles).mockResolvedValue({ items: [vehicle], total: 1, page: 1, limit: 12 });
    vi.mocked(getFilters).mockResolvedValue({
      makes: ['Maruti Suzuki'], models: ['Swift'], categories: ['Hatchback'],
      fuelTypes: ['PETROL'], transmissions: ['MANUAL'], price: { min: 699000, max: 699000 }, year: { min: 2026, max: 2026 },
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(<QueryClientProvider client={queryClient}><MemoryRouter><ListingPage /></MemoryRouter></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'Swift' })).toBeInTheDocument();
    expect(screen.getByText('1 cars')).toBeInTheDocument();
  });
});
