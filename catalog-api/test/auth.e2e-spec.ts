import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.user.deleteMany({ where: { email: 'e2e@test.com' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'e2e@test.com' } });
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@test.com',
        password: 'password123',
        name: 'E2E User',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toEqual('e2e@test.com');

    const userInDb = await prisma.user.findUnique({ where: { email: 'e2e@test.com' } });
    expect(userInDb).toBeDefined();
    expect(userInDb?.name).toEqual('E2E User');
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@test.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });

  it('/users/profile (GET) - Protected', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@test.com',
        password: 'password123',
      });

    const token = loginRes.body.accessToken;

    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toEqual('e2e@test.com');
      });
  });

  it('/users/profile (GET) - Should fail without token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .expect(401);
  });
});
