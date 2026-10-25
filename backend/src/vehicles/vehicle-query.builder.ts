import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VehicleQueryDto, VehicleSort } from './dto/vehicle-query.dto';

export function buildVehicleQuery(query: VehicleQueryDto): {
  where: Prisma.VehicleWhereInput;
  orderBy: Prisma.VehicleOrderByWithRelationInput;
} {
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
    throw new BadRequestException('minPrice cannot be greater than maxPrice');
  }

  const where: Prisma.VehicleWhereInput = {
    ...(query.make && { make: { contains: query.make, mode: 'insensitive' } }),
    ...(query.model && { model: { contains: query.model, mode: 'insensitive' } }),
    ...(query.category && { category: { contains: query.category, mode: 'insensitive' } }),
    ...(query.fuelType && { fuelType: query.fuelType }),
    ...(query.transmission && { transmission: query.transmission }),
    ...(query.condition && { condition: query.condition }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      price: { ...(query.minPrice !== undefined && { gte: query.minPrice }), ...(query.maxPrice !== undefined && { lte: query.maxPrice }) },
    }),
    ...((query.minYear !== undefined || query.maxYear !== undefined) && {
      year: { ...(query.minYear !== undefined && { gte: query.minYear }), ...(query.maxYear !== undefined && { lte: query.maxYear }) },
    }),
    ...(query.maxKm !== undefined && { kmDriven: { lte: query.maxKm } }),
    ...(query.q && {
      OR: ['make', 'model', 'variant'].map((field) => ({
        [field]: { contains: query.q, mode: 'insensitive' },
      })),
    }),
  };

  const orderBy: Record<VehicleSort, Prisma.VehicleOrderByWithRelationInput> = {
    [VehicleSort.PRICE_ASC]: { price: 'asc' },
    [VehicleSort.PRICE_DESC]: { price: 'desc' },
    [VehicleSort.YEAR_DESC]: { year: 'desc' },
    [VehicleSort.NEWEST]: { createdAt: 'desc' },
  };

  return { where, orderBy: orderBy[query.sort] };
}
