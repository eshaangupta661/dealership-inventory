import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Inventory (e2e)', () => {
  let app: INestApplication;
  let db: Pool;
  let adminToken: string;
  let customerToken: string;

  const api = () => request(app.getHttpServer());

  const createVehicle = async (quantity: number) => {
    const res = await api()
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Hyundai', model: 'Creta', variant: 'SX', category: 'SUV',
        fuelType: 'DIESEL', transmission: 'AUTOMATIC', condition: 'USED',
        year: 2021, kmDriven: 30000, ownerCount: 1, price: 1450000,
        quantity, color: 'White',
      })
      .expect(201);
    return res.body.id as number;
  };

  const stockOf = async (id: number) => {
    const { rows } = await db.query('SELECT quantity FROM "Vehicle" WHERE id = $1', [id]);
    return rows[0].quantity as number;
  };

  const registerAndLogin = async (email: string) => {
    const creds = { email, password: 'Password123!' };
    await api().post('/api/auth/register').send(creds).expect(201);
    return (await api().post('/api/auth/login').send(creds).expect(200)).body.accessToken as string;
  };

  const purchase = (id: number, token?: string) => {
    const req = api().post(`/api/vehicles/${id}/purchase`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  const restock = (id: number, body: object, token?: string) => {
    const req = api().post(`/api/vehicles/${id}/restock`).send(body);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
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
    await registerAndLogin('admin@example.com');
    await db.query(`UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com'`);
    adminToken = (
      await api().post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'Password123!' }).expect(200)
    ).body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('decreases quantity by 1 and returns the updated vehicle', async () => {
      const id = await createVehicle(2);
      const res = await purchase(id, customerToken).expect(200);
      expect(res.body.quantity).toBe(1);
      expect(await stockOf(id)).toBe(1);
    });

    it('returns 409 when the vehicle is out of stock', async () => {
      const id = await createVehicle(0);
      await purchase(id, customerToken).expect(409);
      expect(await stockOf(id)).toBe(0);
    });

    it('returns 404 for an unknown vehicle', async () => {
      await purchase(999999, customerToken).expect(404);
    });

    it('returns 401 without a token', async () => {
      const id = await createVehicle(1);
      await purchase(id).expect(401);
      expect(await stockOf(id)).toBe(1);
    });

    it('never lets stock go negative under concurrent purchases', async () => {
      const id = await createVehicle(3);

      const results = await Promise.all(
        Array.from({ length: 10 }, () => purchase(id, customerToken)),
      );

      const ok = results.filter((r) => r.status === 200).length;
      const rejected = results.filter((r) => r.status === 409).length;
      expect(ok).toBe(3);
      expect(rejected).toBe(7);
      expect(await stockOf(id)).toBe(0);
    });
  });

  describe('POST /api/vehicles/:id/restock (admin only)', () => {
    it('increases quantity by the given amount', async () => {
      const id = await createVehicle(1);
      const res = await restock(id, { amount: 5 }, adminToken).expect(200);
      expect(res.body.quantity).toBe(6);
      expect(await stockOf(id)).toBe(6);
    });

    it('returns 403 for a customer and 401 without a token', async () => {
      const id = await createVehicle(1);
      await restock(id, { amount: 5 }, customerToken).expect(403);
      await restock(id, { amount: 5 }).expect(401);
      expect(await stockOf(id)).toBe(1);
    });

    it.each([[0], [-3], [1.5], ['ten']])('returns 400 for amount %p', async (amount) => {
      const id = await createVehicle(1);
      await restock(id, { amount }, adminToken).expect(400);
    });

    it('returns 404 for an unknown vehicle', async () => {
      await restock(999999, { amount: 2 }, adminToken).expect(404);
    });
  });
});