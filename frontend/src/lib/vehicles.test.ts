import { describe, expect, it } from 'vitest';
import { buildQueryParams, formatPrice } from './vehicles';

describe('formatPrice', () => {
  it('formats Indian lakh and crore amounts', () => {
    expect(formatPrice(1450000)).toBe('₹14.5 Lakh');
    expect(formatPrice(12000000)).toBe('₹1.2 Crore');
  });
});

describe('buildQueryParams', () => {
  it('retains only recognised API parameters with numeric values converted', () => {
    const params = new URLSearchParams('q=Swift&minPrice=500000&page=2&unknown=value');
    expect(buildQueryParams(params)).toEqual({ q: 'Swift', minPrice: 500000, page: 2 });
  });

  it('drops empty and invalid numeric parameters', () => {
    const params = new URLSearchParams('make=&page=0&minPrice=-1&minYear=1989&maxKm=not-a-number');
    expect(buildQueryParams(params)).toEqual({});
  });
});
