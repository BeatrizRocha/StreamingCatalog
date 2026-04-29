import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RateLimiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 429 after exceeding rate limit on API routes', async () => {
    for (let i = 0; i < 10; i++) {
       await request(app.getHttpServer()).post('/auth/login').send({}).expect((res) => {
         expect(res.status).not.toBe(429);
       });
    }

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(429)
      .expect((res) => {
        expect(res.body.message).toContain('ThrottlerException');
      });
  });

  it('should NOT return 429 for the root path (Health Check bypass)', async () => {
    for (let i = 0; i < 15; i++) {
       await request(app.getHttpServer()).get('/').expect(200);
    }
  });
});
