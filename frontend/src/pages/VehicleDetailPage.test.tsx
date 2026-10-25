import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { vi } from 'vitest';
import { ApiError } from '../api/client';
import type { Vehicle } from '../api/types';
import { VehicleDetailPage } from './VehicleDetailPage';

const auth = vi.hoisted(() => ({ user: null as { id: number; email: string; role: 'CUSTOMER' | 'ADMIN' } | null }));
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));
vi.mock('../api/vehicles', () => ({ getVehicle: vi.fn(), purchaseVehicle: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
import { getVehicle, purchaseVehicle } from '../api/vehicles';

const vehicle: Vehicle = { id: 1, make: 'Maruti Suzuki', model: 'Swift', variant: 'Sportz', category: 'Hatchback', fuelType: 'PETROL', transmission: 'MANUAL', condition: 'NEW', year: 2026, kmDriven: 0, ownerCount: 1, price: 699000, quantity: 1, color: 'Blue', imageUrl: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

function renderDetail() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/vehicles/1']}><Routes><Route path="/vehicles/:id" element={<VehicleDetailPage />} /><Route path="/login" element={<p>Login page</p>} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe('VehicleDetailPage purchase flow', () => {
  beforeEach(() => {
    auth.user = null;
    vi.mocked(getVehicle).mockResolvedValue(vehicle);
    vi.mocked(purchaseVehicle).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it('disables purchase when quantity is zero', async () => {
    vi.mocked(getVehicle).mockResolvedValue({ ...vehicle, quantity: 0 });
    renderDetail();
    expect(await screen.findByRole('button', { name: 'Sold out' })).toBeDisabled();
  });

  it('shows an anonymous purchase login action', async () => {
    renderDetail();
    fireEvent.click(await screen.findByRole('button', { name: 'Log in to purchase' }));
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('shows the sold-out toast after a purchase conflict', async () => {
    auth.user = { id: 2, email: 'buyer@example.com', role: 'CUSTOMER' };
    vi.mocked(purchaseVehicle).mockRejectedValue(new ApiError(409, 'Conflict'));
    renderDetail();
    fireEvent.click(await screen.findByRole('button', { name: 'Purchase' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm purchase' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('This car was just sold out'));
  });
});
