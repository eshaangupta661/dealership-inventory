import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryService } from './inventory.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [AuthModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, InventoryService],
})
export class VehiclesModule {}