import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let db: Pool;

  const validUser = { email: 'buyer@example.com', password: 'Password123!' };
  const register = (body: object = validUser) =>
    request(app.getHttpServer()).post('/api/auth/register').send(body);
  const login = (body: object = validUser) =>
    request(app.getHttpServer()).post('/api/auth/login').send(body);

  beforeAll(async () => {
    db = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app); // same prefix and pipes as production
    await app.init();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
    await db.end();
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns 201 without any password field', async () => {
      const res = await register().expect(201);

      expect(res.body.email).toBe(validUser.email);
      expect(res.body.role).toBe('CUSTOMER');
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('stores the password hashed, not in plain text', async () => {
      await register().expect(201);

      const { rows } = await db.query('SELECT "passwordHash" FROM "User" WHERE email = $1', [
        validUser.email,
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0].passwordHash).not.toBe(validUser.password);
      expect(rows[0].passwordHash.length).toBeGreaterThan(20);
    });

    it('returns 409 for a duplicate email', async () => {
      await register().expect(201);
      await register().expect(409);
    });

    it('returns 400 for an invalid email', async () => {
      await register({ email: 'not-an-email', password: 'Password123!' }).expect(400);
    });

    it('returns 400 for a password shorter than 8 characters', async () => {
      await register({ email: 'short@example.com', password: 'abc123' }).expect(400);
    });

    it('rejects a body that tries to set role (mass assignment) and creates no user', async () => {
      // forbidNonWhitelisted is on, so unknown fields give 400 rather than being ignored
      await register({ ...validUser, role: 'ADMIN' }).expect(400);

      const { rows } = await db.query('SELECT 1 FROM "User" WHERE email = $1', [validUser.email]);
      expect(rows).toHaveLength(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await register().expect(201);
    });

    it('returns 200 and an access token for valid credentials', async () => {
      const res = await login().expect(200);

      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.split('.')).toHaveLength(3);
    });

    it('returns 401 for a wrong password', async () => {
      await login({ email: validUser.email, password: 'WrongPassword1!' }).expect(401);
    });

    it('returns 401 for an unknown email with the same message as a wrong password', async () => {
      const wrongPassword = await login({ email: validUser.email, password: 'WrongPassword1!' });
      const unknownEmail = await login({ email: 'ghost@example.com', password: 'Password123!' });

      expect(unknownEmail.status).toBe(401);
      expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
    });
  });

  describe('JWT protection (GET /api/auth/me)', () => {
    const me = (token?: string) => {
      const req = request(app.getHttpServer()).get('/api/auth/me');
      return token ? req.set('Authorization', `Bearer ${token}`) : req;
    };

    it('returns the current user for a valid token, without a password hash', async () => {
      await register().expect(201);
      const { body } = await login().expect(200);

      const res = await me(body.accessToken).expect(200);

      expect(res.body.email).toBe(validUser.email);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('returns 401 with no token', async () => {
      await me().expect(401);
    });

    it('returns 401 for a malformed token', async () => {
      await me('not.a.jwt').expect(401);
    });

    it('returns 401 for a token signed with the wrong secret', async () => {
      const forged = jwt.sign({ sub: '1', role: 'ADMIN' }, 'some-other-secret');
      await me(forged).expect(401);
    });

    it('returns 401 for an expired token', async () => {
      const expired = jwt.sign({ sub: '1', role: 'CUSTOMER' }, process.env.JWT_SECRET as string, {
        expiresIn: -10,
      });
      await me(expired).expect(401);
    });
  });
});