import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { ContentType, ContentStatus } from '@prisma/client';

describe('UserContentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Create test user and get token
    const email = 'usercontent-e2e@test.com';
    await prisma.user.deleteMany({ where: { email } });
    
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'UserContent E2E' });
    
    userId = regRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });
    
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.userContent.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('/user-content (POST) - Upsert', () => {
    it('should create new content entry', async () => {
      const payload = {
        tmdbId: '69478',
        type: ContentType.TV,
        status: ContentStatus.WATCHLIST,
        title: 'The Handmaid\'s Tale',
      };

      const res = await request(app.getHttpServer())
        .post('/user-content')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.tmdbId).toEqual(payload.tmdbId);
      expect(res.body.status).toEqual(payload.status);
    });

    it('should update existing content (Upsert)', async () => {
      const payload = {
        tmdbId: '69478',
        type: ContentType.TV,
        status: ContentStatus.WATCHED,
        rating: 5,
      };

      const res = await request(app.getHttpServer())
        .post('/user-content')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.status).toEqual(ContentStatus.WATCHED);
      expect(res.body.rating).toEqual(5);
    });

    it('should fail with invalid rating', async () => {
      const payload = {
        tmdbId: '69478',
        type: ContentType.TV,
        status: ContentStatus.WATCHED,
        rating: 10, // Invalid: max is 5
      };

      await request(app.getHttpServer())
        .post('/user-content')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('/user-content (GET)', () => {
    it('should list user content', async () => {
      const res = await request(app.getHttpServer())
        .get('/user-content')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter content by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/user-content?status=WATCHED')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.every((item: any) => item.status === 'WATCHED')).toBe(true);
    });
  });

  describe('/user-content/:type/:tmdbId (GET)', () => {
    it('should return specific content status', async () => {
      const res = await request(app.getHttpServer())
        .get(`/user-content/${ContentType.TV}/69478`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.tmdbId).toEqual('69478');
    });

    it('should return 404 for non-existent content', async () => {
      await request(app.getHttpServer())
        .get(`/user-content/${ContentType.MOVIE}/nonexistent`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/user-content/:type/:tmdbId (DELETE)', () => {
    it('should remove content from list', async () => {
      await request(app.getHttpServer())
        .delete(`/user-content/${ContentType.TV}/69478`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/user-content/${ContentType.TV}/69478`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
