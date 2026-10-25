import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Condition, FuelType, Transmission } from '@prisma/client';

export enum VehicleSort {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  YEAR_DESC = 'year_desc',
  NEWEST = 'newest',
}

export class VehicleQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;

  @IsOptional()
  @IsEnum(VehicleSort)
  sort: VehicleSort = VehicleSort.NEWEST;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1990)
  minYear?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1990)
  maxYear?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxKm?: number;
}
