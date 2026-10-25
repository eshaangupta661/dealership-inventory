import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildVehicleQuery } from './vehicle-query.builder';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.create({ data: dto });
  }

  async findAll(query: VehicleQueryDto) {
    const { where, orderBy } = buildVehicleQuery(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    await this.findOne(id);
    return this.prisma.vehicle.update({ data: dto, where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
  }

  async filters() {
    const [makes, models, categories, fuelTypes, transmissions, price, year] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({ distinct: ['make'], select: { make: true }, orderBy: { make: 'asc' } }),
      this.prisma.vehicle.findMany({ distinct: ['model'], select: { model: true }, orderBy: { model: 'asc' } }),
      this.prisma.vehicle.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } }),
      this.prisma.vehicle.findMany({ distinct: ['fuelType'], select: { fuelType: true }, orderBy: { fuelType: 'asc' } }),
      this.prisma.vehicle.findMany({ distinct: ['transmission'], select: { transmission: true }, orderBy: { transmission: 'asc' } }),
      this.prisma.vehicle.aggregate({ _min: { price: true }, _max: { price: true } }),
      this.prisma.vehicle.aggregate({ _min: { year: true }, _max: { year: true } }),
    ]);
    return {
      makes: makes.map(({ make }) => make),
      models: models.map(({ model }) => model),
      categories: categories.map(({ category }) => category),
      fuelTypes: fuelTypes.map(({ fuelType }) => fuelType),
      transmissions: transmissions.map(({ transmission }) => transmission),
      price: { min: price._min.price, max: price._max.price },
      year: { min: year._min.year, max: year._max.year },
    };
  }
}
