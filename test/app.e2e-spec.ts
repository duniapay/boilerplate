/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, LoggerService } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { HealthController } from 'src/health/health.controller';
import { TestLogger } from './mocks/logger.mock';

describe('E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new TestLogger());
    await app.init();

    // tip: access the database connection via
    // const connection = app.get(Connection)
    // const a = connection.manager
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(401)
      .expect({ statusCode: 401, message: 'Unauthorized' });
  });
});
