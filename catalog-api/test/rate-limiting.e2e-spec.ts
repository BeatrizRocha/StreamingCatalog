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

  it('should return 429 after exceeding rate limit on API routes', async () => {
    // Threshold is 10 requests per 60s
    // We'll use /auth/login (even if it returns 400/401, it should still throttle)
    for (let i = 0; i < 10; i++) {
       await request(app.getHttpServer()).post('/auth/login').send({}).expect((res) => {
         // We expect 400 or 429, but specifically checking that for the first 10 it's NOT 429
         expect(res.status).not.toBe(429);
       });
    }

    // The 11th request should fail with 429
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(429)
      .expect((res) => {
        expect(res.body.message).toContain('ThrottlerException');
      });
  });

  it('should NOT return 429 for the root path (Health Check bypass)', async () => {
    // Root path has @SkipThrottle()
    // Even after 15 requests, it should still return 200
    for (let i = 0; i < 15; i++) {
       await request(app.getHttpServer()).get('/').expect(200);
    }
  });
});
