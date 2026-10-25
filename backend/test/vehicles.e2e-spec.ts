import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Vehicles (e2e)', () => {
  let app: INestApplication;
  let db: Pool;
  let adminToken: string;
  let customerToken: string;

  const api = () => request(app.getHttpServer());

  const sampleVehicle = {
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX Diesel AT',
    category: 'SUV',
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    condition: 'USED',
    year: 2021,
    kmDriven: 32000,
    ownerCount: 1,
    price: 1450000,
    quantity: 2,
    color: 'White',
    imageUrl: 'https://example.com/creta.jpg',
  };

  const createVehicle = async (overrides: object = {}) => {
    const res = await api()
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...sampleVehicle, ...overrides })
      .expect(201);
    return res.body;
  };

  const registerAndLogin = async (email: string) => {
    const creds = { email, password: 'Password123!' };
    await api().post('/api/auth/register').send(creds).expect(201);
    const res = await api().post('/api/auth/login').send(creds).expect(200);
    return res.body.accessToken as string;
  };

  beforeAll(async () => {
    db = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE TABLE "Vehicle", "User" RESTART IDENTITY CASCADE');
    customerToken = await registerAndLogin('customer@example.com');
    // Admins cannot register through the API, so promote one directly in the DB.
    await registerAndLogin('admin@example.com');
    await db.query(`UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com'`);
    adminToken = (
      await api()
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'Password123!' })
        .expect(200)
    ).body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  describe('POST /api/vehicles (admin only)', () => {
    it('creates a vehicle as admin and returns 201 with an id', async () => {
      const res = await api()
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleVehicle)
        .expect(201);

      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body).toMatchObject({ make: 'Hyundai', model: 'Creta', price: 1450000 });
    });

    it('returns 401 without a token', async () => {
      await api().post('/api/vehicles').send(sampleVehicle).expect(401);
    });

    it('returns 403 for a customer', async () => {
      await api()
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(sampleVehicle)
        .expect(403);
    });

    it.each([
      ['negative price', { price: -1 }],
      ['zero price', { price: 0 }],
      ['negative quantity', { quantity: -1 }],
      ['invalid fuel type', { fuelType: 'STEAM' }],
      ['future-impossible year', { year: 1800 }],
      ['unknown field', { hacker: true }],
    ])('returns 400 for %s', async (_label, overrides) => {
      await api()
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...sampleVehicle, ...overrides })
        .expect(400);
    });
  });

  describe('public reads (viewer, no token)', () => {
    it('GET /api/vehicles lists vehicles with pagination metadata', async () => {
      await createVehicle();
      await createVehicle({ make: 'Maruti Suzuki', model: 'Swift', category: 'Hatchback' });

      const res = await api().get('/api/vehicles').expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body).toMatchObject({ total: 2, page: 1 });
    });

    it('paginates with page and limit', async () => {
      for (let i = 0; i < 5; i++) await createVehicle({ price: 500000 + i });

      const res = await api().get('/api/vehicles?page=2&limit=2').expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.page).toBe(2);
    });

    it('GET /api/vehicles/:id returns one vehicle', async () => {
      const created = await createVehicle();
      const res = await api().get(`/api/vehicles/${created.id}`).expect(200);
      expect(res.body.model).toBe('Creta');
    });

    it('GET /api/vehicles/:id returns 404 for an unknown id', async () => {
      await api().get('/api/vehicles/999999').expect(404);
    });

    it('GET /api/vehicles/:id returns 400 for a non-numeric id', async () => {
      await api().get('/api/vehicles/abc').expect(400);
    });

    it('GET /api/vehicles/filters returns the options for the filter sidebar', async () => {
      await createVehicle();
      await createVehicle({
        make: 'Tata', model: 'Nexon', category: 'SUV', fuelType: 'ELECTRIC', price: 1600000,
      });

      const res = await api().get('/api/vehicles/filters').expect(200);

      expect(res.body.makes).toEqual(expect.arrayContaining(['Hyundai', 'Tata']));
      expect(res.body.categories).toEqual(['SUV']);
      expect(res.body.fuelTypes).toEqual(expect.arrayContaining(['DIESEL', 'ELECTRIC']));
      expect(res.body.price).toEqual({ min: 1450000, max: 1600000 });
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await createVehicle(); // Hyundai Creta SUV diesel auto used 14.5L
      await createVehicle({
        make: 'Maruti Suzuki', model: 'Swift', category: 'Hatchback', fuelType: 'PETROL',
        transmission: 'MANUAL', price: 650000, year: 2018, kmDriven: 60000,
      });
      await createVehicle({
        make: 'Tata', model: 'Nexon EV', category: 'SUV', fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC', condition: 'NEW', price: 1700000, year: 2024, kmDriven: 0,
      });
    });

    const search = (qs: string) => api().get(`/api/vehicles/search?${qs}`).expect(200);

    it('filters by make, case-insensitively', async () => {
      const res = await search('make=hyundai');
      expect(res.body.items.map((v: any) => v.model)).toEqual(['Creta']);
    });

    it('filters by model', async () => {
      const res = await search('model=Swift');
      expect(res.body.items).toHaveLength(1);
    });

    it('filters by category', async () => {
      const res = await search('category=SUV');
      expect(res.body.total).toBe(2);
    });

    it('filters by fuel type, transmission and condition', async () => {
      expect((await search('fuelType=ELECTRIC')).body.total).toBe(1);
      expect((await search('transmission=MANUAL')).body.total).toBe(1);
      expect((await search('condition=NEW')).body.total).toBe(1);
    });

    it('filters by price range', async () => {
      const res = await search('minPrice=600000&maxPrice=1500000');
      expect(res.body.items.map((v: any) => v.model).sort()).toEqual(['Creta', 'Swift']);
    });

    it('filters by year range and maximum km driven', async () => {
      expect((await search('minYear=2020')).body.total).toBe(2);
      expect((await search('maxKm=40000')).body.total).toBe(2);
    });

    it('free-text q matches make or model', async () => {
      expect((await search('q=nexon')).body.total).toBe(1);
      expect((await search('q=maruti')).body.total).toBe(1);
    });

    it('combines several filters', async () => {
      const res = await search('category=SUV&fuelType=DIESEL&maxPrice=1500000');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].model).toBe('Creta');
    });

    it('sorts by price ascending and descending', async () => {
      const asc = await search('sort=price_asc');
      const desc = await search('sort=price_desc');
      expect(asc.body.items[0].model).toBe('Swift');
      expect(desc.body.items[0].model).toBe('Nexon EV');
    });

    it('returns an empty list, not an error, when nothing matches', async () => {
      const res = await search('make=Ferrari');
      expect(res.body.items).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('returns 400 when minPrice is greater than maxPrice', async () => {
      await api().get('/api/vehicles/search?minPrice=2000000&maxPrice=1000000').expect(400);
    });
  });

  describe('PUT /api/vehicles/:id (admin only)', () => {
    it('updates the given fields and returns the updated vehicle', async () => {
      const created = await createVehicle();
      const res = await api()
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 1399000 })
        .expect(200);

      expect(res.body.price).toBe(1399000);
      expect(res.body.model).toBe('Creta');
    });

    it('returns 404 for an unknown id', async () => {
      await api()
        .put('/api/vehicles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 1000000 })
        .expect(404);
    });

    it('returns 403 for a customer and 401 without a token', async () => {
      const created = await createVehicle();
      await api()
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 1 })
        .expect(403);
      await api().put(`/api/vehicles/${created.id}`).send({ price: 1 }).expect(401);
    });

    it('returns 400 for an invalid value', async () => {
      const created = await createVehicle();
      await api()
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: -5 })
        .expect(400);
    });
  });

  describe('DELETE /api/vehicles/:id (admin only)', () => {
    it('returns 204 for admin, then 404 on a second read', async () => {
      const created = await createVehicle();
      await api()
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
      await api().get(`/api/vehicles/${created.id}`).expect(404);
    });

    it('returns 403 for a customer and 401 without a token', async () => {
      const created = await createVehicle();
      await api()
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
      await api().delete(`/api/vehicles/${created.id}`).expect(401);
    });

    it('returns 404 for an unknown id', async () => {
      await api()
        .delete('/api/vehicles/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});