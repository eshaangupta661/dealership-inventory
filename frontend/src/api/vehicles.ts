import { apiClient } from './client';
import type { FilterOptions, Vehicle, VehicleCondition, VehicleListResponse } from './types';

export type VehicleSearchParams = Partial<{
  q: string; make: string; model: string; category: string; fuelType: string; transmission: string;
  condition: VehicleCondition; minPrice: number; maxPrice: number; minYear: number; maxYear: number;
  maxKm: number; sort: string; page: number; limit: number;
}>;

export type VehiclePayload = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'> & { imageUrl?: string };

function query(params: VehicleSearchParams) {
  const values = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') values.set(key, String(value));
  });
  const suffix = values.toString();
  return suffix ? `?${suffix}` : '';
}

export const listVehicles = (params: VehicleSearchParams = {}) =>
  apiClient<VehicleListResponse>(`/vehicles/search${query(params)}`);
export const getVehicle = (id: number) => apiClient<Vehicle>(`/vehicles/${id}`);
export const getFilters = () => apiClient<FilterOptions>('/vehicles/filters');
export const createVehicle = (vehicle: VehiclePayload) => apiClient<Vehicle>('/vehicles', { method: 'POST', body: vehicle });
export const updateVehicle = (id: number, vehicle: Partial<VehiclePayload>) =>
  apiClient<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: vehicle });
export const deleteVehicle = (id: number) => apiClient<void>(`/vehicles/${id}`, { method: 'DELETE' });
export const purchaseVehicle = (id: number) => apiClient<Vehicle>(`/vehicles/${id}/purchase`, { method: 'POST' });
export const restockVehicle = (id: number, amount: number) =>
  apiClient<Vehicle>(`/vehicles/${id}/restock`, { method: 'POST', body: { amount } });
