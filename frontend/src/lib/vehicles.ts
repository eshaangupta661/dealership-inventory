import type { VehicleSearchParams } from '../api/vehicles';

const QUERY_KEYS = ['q', 'make', 'model', 'category', 'fuelType', 'transmission', 'condition', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'maxKm', 'sort', 'page'] as const;
const NUMBER_KEYS = new Set(['minPrice', 'maxPrice', 'minYear', 'maxYear', 'maxKm', 'page']);

function isValidNumber(key: string, value: number) {
  if (!Number.isInteger(value)) return false;
  if (key === 'page') return value >= 1;
  if (key === 'minYear' || key === 'maxYear') return value >= 1990;
  return value >= 0;
}

export function buildQueryParams(searchParams: URLSearchParams): VehicleSearchParams {
  return QUERY_KEYS.reduce<VehicleSearchParams>((params, key) => {
    const value = searchParams.get(key);
    if (value === null || value === '') return params;
    if (NUMBER_KEYS.has(key)) {
      const number = Number(value);
      if (isValidNumber(key, number)) (params as Record<string, string | number>)[key] = number;
    } else {
      (params as Record<string, string | number>)[key] = value;
    }
    return params;
  }, {});
}

export function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Crore`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh`;
  return `₹${new Intl.NumberFormat('en-IN').format(price)}`;
}
