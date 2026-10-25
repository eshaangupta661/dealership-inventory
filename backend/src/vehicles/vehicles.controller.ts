import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { VehiclesService } from './vehicles.service';
import { RestockDto } from './dto/restock.dto';
import { InventoryService } from './inventory.service';
@Controller('vehicles')
export class VehiclesController {
  constructor(
  private readonly vehiclesService: VehiclesService,
  private readonly inventoryService: InventoryService,
) {}
  @Get()
  findAll(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get('filters')
  filters() {
    return this.vehiclesService.filters();
  }

  @Get('search')
  search(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.vehiclesService.remove(id);
  }
  
  @Post(':id/purchase')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  purchase(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.purchase(id);
  }

  @Post(':id/restock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  restock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RestockDto,
  ) {
    return this.inventoryService.restock(id, dto.amount);
  }
}
