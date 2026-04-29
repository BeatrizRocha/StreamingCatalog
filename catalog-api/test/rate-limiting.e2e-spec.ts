import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RateLimiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 429 after exceeding rate limit', async () => {
    // Threshold is 10 requests per 60s
    // Send 10 requests (should pass)
    for (let i = 0; i < 10; i++) {
       await request(app.getHttpServer()).get('/').expect(200);
    }

    // The 11th request should fail with 429
    return request(app.getHttpServer())
      .get('/')
      .expect(429)
      .expect((res) => {
        expect(res.body.message).toContain('ThrottlerException');
      });
  });
});
