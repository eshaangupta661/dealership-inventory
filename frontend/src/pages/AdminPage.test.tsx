import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Vehicle } from '../api/types';
import { AdminPage } from './AdminPage';

vi.mock('../api/vehicles', () => ({ listVehicles: vi.fn(), createVehicle: vi.fn(), updateVehicle: vi.fn(), deleteVehicle: vi.fn(), restockVehicle: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
import { deleteVehicle, listVehicles, restockVehicle } from '../api/vehicles';

const vehicle: Vehicle = { id: 1, make: 'Maruti Suzuki', model: 'Swift', variant: 'Sportz', category: 'Hatchback', fuelType: 'PETROL', transmission: 'MANUAL', condition: 'NEW', year: 2026, kmDriven: 0, ownerCount: 1, price: 699000, quantity: 2, color: 'Blue', imageUrl: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

function renderAdmin() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><AdminPage /></MemoryRouter></QueryClientProvider>);
}

describe('AdminPage actions', () => {
  beforeEach(() => {
    vi.mocked(listVehicles).mockResolvedValue({ items: [vehicle], total: 1, page: 1, limit: 10 });
    vi.mocked(deleteVehicle).mockReset();
    vi.mocked(restockVehicle).mockReset();
  });

  it('does not delete until deletion is confirmed', async () => {
    renderAdmin();
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog', { name: 'Delete vehicle' })).toBeInTheDocument();
    expect(deleteVehicle).not.toHaveBeenCalled();
  });

  it.each(['0', '-1'])('rejects an invalid restock amount of %s before requesting', async (value) => {
    renderAdmin();
    fireEvent.click(await screen.findByRole('button', { name: 'Restock' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Restock amount' }), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restock' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Restock amount must be a positive whole number.');
    expect(restockVehicle).not.toHaveBeenCalled();
  });
});
