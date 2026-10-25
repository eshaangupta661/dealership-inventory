import 'dotenv/config';
import { Condition, FuelType, PrismaClient, Role, Transmission } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const ADMIN = {
  email: 'admin@dealer.com',
  password: 'Admin@12345',
  role: Role.ADMIN,
} as const;

const CUSTOMER = {
  email: 'customer@dealer.com',
  password: 'Customer@12345',
  role: Role.CUSTOMER,
} as const;

const prisma = new PrismaClient();
const CURRENT_YEAR = new Date().getFullYear();

type VehicleModel = {
  make: string;
  model: string;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV';
  fuels: FuelType[];
  transmissions: Transmission[];
  priceRange: readonly [number, number];
};

const MODELS: VehicleModel[] = [
  { make: 'Maruti Suzuki', model: 'Swift', category: 'Hatchback', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [650000, 1000000] },
  { make: 'Maruti Suzuki', model: 'Dzire', category: 'Sedan', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [680000, 1050000] },
  { make: 'Maruti Suzuki', model: 'Brezza', category: 'SUV', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [850000, 1450000] },
  { make: 'Maruti Suzuki', model: 'Baleno', category: 'Hatchback', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [700000, 1100000] },
  { make: 'Maruti Suzuki', model: 'WagonR', category: 'Hatchback', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [550000, 850000] },
  { make: 'Maruti Suzuki', model: 'Grand Vitara', category: 'SUV', fuels: [FuelType.PETROL, FuelType.HYBRID, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 2300000] },
  { make: 'Hyundai', model: 'Creta', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 2400000] },
  { make: 'Hyundai', model: 'i20', category: 'Hatchback', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [750000, 1200000] },
  { make: 'Hyundai', model: 'Venue', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [800000, 1450000] },
  { make: 'Hyundai', model: 'Verna', category: 'Sedan', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 1800000] },
  { make: 'Tata', model: 'Nexon', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [800000, 1600000] },
  { make: 'Tata', model: 'Punch', category: 'SUV', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [650000, 1100000] },
  { make: 'Tata', model: 'Harrier', category: 'SUV', fuels: [FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1550000, 2700000] },
  { make: 'Tata', model: 'Tiago', category: 'Hatchback', fuels: [FuelType.PETROL, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [530000, 900000] },
  { make: 'Tata', model: 'Safari', category: 'SUV', fuels: [FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1650000, 2800000] },
  { make: 'Mahindra', model: 'XUV700', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1450000, 2900000] },
  { make: 'Mahindra', model: 'Thar', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 1850000] },
  { make: 'Mahindra', model: 'Scorpio-N', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1350000, 2500000] },
  { make: 'Mahindra', model: 'XUV 3XO', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [800000, 1600000] },
  { make: 'Kia', model: 'Seltos', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1100000, 2200000] },
  { make: 'Kia', model: 'Sonet', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [800000, 1600000] },
  { make: 'Kia', model: 'Carens', category: 'MUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1100000, 2000000] },
  { make: 'Toyota', model: 'Innova Crysta', category: 'MUV', fuels: [FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [2000000, 2800000] },
  { make: 'Toyota', model: 'Fortuner', category: 'SUV', fuels: [FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [3500000, 5500000] },
  { make: 'Toyota', model: 'Hyryder', category: 'SUV', fuels: [FuelType.PETROL, FuelType.HYBRID, FuelType.CNG], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 2200000] },
  { make: 'Honda', model: 'City', category: 'Sedan', fuels: [FuelType.PETROL, FuelType.HYBRID], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1200000, 2300000] },
  { make: 'Honda', model: 'Elevate', category: 'SUV', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1200000, 1800000] },
  { make: 'Skoda', model: 'Slavia', category: 'Sedan', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1100000, 1900000] },
  { make: 'Skoda', model: 'Kushaq', category: 'SUV', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1150000, 2100000] },
  { make: 'MG', model: 'Hector', category: 'SUV', fuels: [FuelType.PETROL, FuelType.DIESEL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1500000, 2400000] },
  { make: 'MG', model: 'Astor', category: 'SUV', fuels: [FuelType.PETROL], transmissions: [Transmission.MANUAL, Transmission.AUTOMATIC], priceRange: [1000000, 1800000] },
  { make: 'Tata', model: 'Nexon EV', category: 'SUV', fuels: [FuelType.ELECTRIC], transmissions: [Transmission.AUTOMATIC], priceRange: [1250000, 1800000] },
  { make: 'MG', model: 'ZS EV', category: 'SUV', fuels: [FuelType.ELECTRIC], transmissions: [Transmission.AUTOMATIC], priceRange: [1900000, 2700000] },
  { make: 'Mahindra', model: 'XUV400', category: 'SUV', fuels: [FuelType.ELECTRIC], transmissions: [Transmission.AUTOMATIC], priceRange: [1550000, 2050000] },
  { make: 'Hyundai', model: 'Creta Electric', category: 'SUV', fuels: [FuelType.ELECTRIC], transmissions: [Transmission.AUTOMATIC], priceRange: [1800000, 2500000] },
];

const VARIANTS = ['Base', 'S', 'Sportz', 'VX', 'ZX', 'XZ+', 'AX7', 'GT Line'];
const COLORS = ['Pearl White', 'Midnight Black', 'Steel Grey', 'Fiery Red', 'Deep Blue', 'Silver'];

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seededRandom(20261025);
const pick = <T>(values: readonly T[]) => values[Math.floor(random() * values.length)];
const integer = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

function createVehicle(model: VehicleModel, index: number) {
  const condition = index % 3 === 0 ? Condition.NEW : Condition.USED;
  const year = condition === Condition.NEW ? CURRENT_YEAR : integer(2015, 2024);
  const kmDriven = condition === Condition.NEW ? 0 : integer(12000, 155000);
  const ownerCount = condition === Condition.NEW ? 1 : integer(1, 3);
  const [minPrice, maxPrice] = model.priceRange;
  const ageDiscount = condition === Condition.NEW ? 1 : Math.max(0.35, 1 - (CURRENT_YEAR - year) * 0.065 - kmDriven / 500000);
  const price = Math.round((minPrice + (maxPrice - minPrice) * random()) * ageDiscount / 1000) * 1000;

  return {
    make: model.make,
    model: model.model,
    variant: `${pick(VARIANTS)} ${condition === Condition.NEW ? 'New' : 'Certified'}`,
    category: model.category,
    fuelType: pick(model.fuels),
    transmission: pick(model.transmissions),
    condition,
    year,
    kmDriven,
    ownerCount,
    price: Math.max(100000, price),
    quantity: index < 5 ? 0 : integer(0, 5),
    color: pick(COLORS),
    imageUrl: null,
  };
}

function assertDevDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL must be set before seeding.');
  if (databaseUrl === testDatabaseUrl || /dealership_test/i.test(databaseUrl)) {
    throw new Error('Refusing to seed a test database. Use the development DATABASE_URL.');
  }
}

async function main() {
  assertDevDatabase();

  const [adminHash, customerHash] = await Promise.all([
    bcrypt.hash(ADMIN.password, 10),
    bcrypt.hash(CUSTOMER.password, 10),
  ]);
  await Promise.all([
    prisma.user.upsert({
      where: { email: ADMIN.email },
      update: { passwordHash: adminHash, role: ADMIN.role },
      create: { email: ADMIN.email, passwordHash: adminHash, role: ADMIN.role },
    }),
    prisma.user.upsert({
      where: { email: CUSTOMER.email },
      update: { passwordHash: customerHash, role: CUSTOMER.role },
      create: { email: CUSTOMER.email, passwordHash: customerHash, role: CUSTOMER.role },
    }),
  ]);

  const existingVehicles = await prisma.vehicle.count();
  const reset = process.env.SEED_RESET === 'true';
  if (existingVehicles === 0 || reset) {
    if (reset) await prisma.vehicle.deleteMany();
    await prisma.vehicle.createMany({
      data: Array.from({ length: 60 }, (_, index) => createVehicle(MODELS[index % MODELS.length], index)),
    });
    console.log(`Created 60 vehicles${reset ? ' after reset' : ''}.`);
  } else {
    console.log(`Kept ${existingVehicles} existing vehicles (set SEED_RESET=true to replace them).`);
  }

  console.log('\nDemo credentials:');
  console.log(`ADMIN: ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`CUSTOMER: ${CUSTOMER.email} / ${CUSTOMER.password}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
