import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';

describe('Logs E2E', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Cast the underlying HTTP server to a concrete type once
    httpServer = app.getHttpServer() as unknown as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject requests without API key', async () => {
    await request(httpServer).get('/logs').expect(401);
  });

  it('should create a log', async () => {
    await request(httpServer)
      .post('/logs')
      .set('x-api-key', 'valid-key')
      .send({
        // Only the fields that CreateLogDto actually expects
        serviceName: 'test-service',
        level: 'INFO',
        message: 'hello',
        requestId: 'req1',
        context: {},
      })
      .expect(201);
  });

  it('should fetch logs with pagination', async () => {
    await request(httpServer)
      .get('/logs?page=1&pageSize=10')
      .set('x-api-key', 'valid-key')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
      });
  });
});
