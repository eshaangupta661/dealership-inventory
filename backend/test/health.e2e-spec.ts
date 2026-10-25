import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.config';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;
  let testDatabase: Pool;

  beforeAll(async () => {
    testDatabase = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    await testDatabase.query('SELECT 1');

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await testDatabase.end();
  });

  it('GET /api/health returns ok', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
  });
});
