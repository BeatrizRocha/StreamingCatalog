import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
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
  });
});
