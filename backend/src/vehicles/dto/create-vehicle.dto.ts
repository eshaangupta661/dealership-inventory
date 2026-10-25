import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Condition, FuelType, Transmission } from '@prisma/client';

const nextYear = new Date().getFullYear() + 1;

export class CreateVehicleDto {
  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsString()
  variant!: string;

  @IsString()
  category!: string;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsEnum(Transmission)
  transmission!: Transmission;

  @IsEnum(Condition)
  condition!: Condition;

  @Type(() => Number)
  @IsInt()
  @Min(1990)
  @Max(nextYear)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  kmDriven!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  ownerCount = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity = 0;

  @IsString()
  color!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
