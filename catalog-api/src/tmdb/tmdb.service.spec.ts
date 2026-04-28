import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AxiosResponse } from 'axios';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpService: HttpService;
  let loggerSpy: jest.SpyInstance;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'TMDB_BASE_URL') return 'https://api.themoviedb.org/3';
      if (key === 'TMDB_ACCESS_TOKEN') return 'test_access_token';
      return null;
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    httpService = module.get<HttpService>(HttpService);
    loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should successfully fetch data from TMDb', async () => {
      const mockData = { results: [{ id: 1, title: 'Test Movie' }] };
      const mockAxiosResponse: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockAxiosResponse));

      const result = await service.get('/trending/all/day');
      
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/all/day',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_access_token',
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should throw an HttpException when TMDb request fails', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        throwError(() => ({
          response: { data: 'Unauthorized' },
          message: 'Error',
        })),
      );

      await expect(service.get('/fail-route')).rejects.toThrow(
        new HttpException('Failed to fetch data from TMDb', HttpStatus.BAD_GATEWAY),
      );
    });

    it('should return cached data if available', async () => {
      const mockData = { id: 1, title: 'Cached Movie' };
      mockCacheManager.get.mockResolvedValueOnce(mockData);

      const result = await service.get('/movie/1');

      expect(mockCacheManager.get).toHaveBeenCalled();
      expect(mockHttpService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should fallback to API if cache.get fails', async () => {
      const mockData = { id: 1, title: 'Fresh Movie' };
      const mockAxiosResponse: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockCacheManager.get.mockRejectedValueOnce(new Error('Redis Down'));
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockAxiosResponse));
      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      const result = await service.get('/movie/1');

      expect(loggerWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Cache lookup failed'));
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(result).toEqual(mockData);
      
      loggerWarnSpy.mockRestore();
    });

    it('should still return data if cache.set fails', async () => {
      const mockData = { id: 1, title: 'Fresh Movie' };
      const mockAxiosResponse: AxiosResponse = {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockCacheManager.get.mockResolvedValueOnce(null);
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockAxiosResponse));
      mockCacheManager.set.mockRejectedValueOnce(new Error('Redis Down'));
      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      const result = await service.get('/movie/1');

      expect(loggerWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to save to cache'));
      expect(result).toEqual(mockData);

      loggerWarnSpy.mockRestore();
    });
  });
});
