import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Decrements stock by one in a single conditional UPDATE.
   * Postgres locks the row for the duration of the statement and re-checks
   * `quantity > 0` after waiting, so two buyers can never both take the last car.
   */
  async purchase(id: number): Promise<Vehicle> {
    const { count } = await this.prisma.vehicle.updateMany({
      where: { id, quantity: { gt: 0 } },
      data: { quantity: { decrement: 1 } },
    });

    if (count === 0) {
      // Zero rows changed: either the vehicle doesn't exist or it's sold out.
      const exists = await this.prisma.vehicle.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException('Vehicle not found');
      throw new ConflictException('Vehicle is out of stock');
    }

    return this.prisma.vehicle.findUniqueOrThrow({ where: { id } });
  }

  async restock(id: number, amount: number): Promise<Vehicle> {
    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: { quantity: { increment: amount } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Vehicle not found');
      }
      throw error;
    }
  }
}