export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type VehicleCondition = 'NEW' | 'USED';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  variant: string;
  category: string;
  fuelType: FuelType;
  transmission: Transmission;
  condition: VehicleCondition;
  year: number;
  kmDriven: number;
  ownerCount: number;
  price: number;
  quantity: number;
  color: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  items: Vehicle[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterOptions {
  makes: string[];
  models: string[];
  categories: string[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  price: { min: number; max: number };
  year: { min: number; max: number };
}

export interface User {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}
