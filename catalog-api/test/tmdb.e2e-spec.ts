import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../src/prisma/prisma.service';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('TmdbController (e2e)', () => {
  let app: INestApplication;

  const mockFakeData = { results: [{ id: 100, title: 'Mocked Movie' }] };

  const mockHttpService = {
    get: jest.fn().mockReturnValue(of({ data: mockFakeData, status: 200, statusText: 'OK', headers: {}, config: {} } as AxiosResponse)),
  };

  const inMemoryCache = new Map();

  const mockCacheManager = {
    get: jest.fn().mockImplementation((key) => Promise.resolve(inMemoryCache.get(key))),
    set: jest.fn().mockImplementation((key, value) => {
      inMemoryCache.set(key, value);
      return Promise.resolve();
    }),
  };

  const mockPrismaService = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tmdb/trending (GET)', () => {
    it('should intercept the request, bypass real auth, and return mocked proxy data', () => {
      return request(app.getHttpServer())
        .get('/tmdb/trending')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toEqual(mockFakeData);
          expect(mockHttpService.get).toHaveBeenCalledTimes(1);
        });
    });

    it('should return from cache on the second request without calling HttpService again', async () => {
      mockHttpService.get.mockClear();
      await request(app.getHttpServer()).get('/tmdb/trending').expect(200);
      expect(mockHttpService.get).toHaveBeenCalledTimes(0);
    });
  });

  describe('/tmdb/search (GET)', () => {
    it('should perform a search correctly', () => {
      return request(app.getHttpServer())
        .get('/tmdb/search?query=avatar')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toEqual(mockFakeData);
        });
    });
  });

  describe('/tmdb/details/:type/:id (GET)', () => {
    it('should return details for valid parameters', () => {
      return request(app.getHttpServer())
        .get('/tmdb/details/movie/123')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toEqual(mockFakeData);
        });
    });
  });
});
