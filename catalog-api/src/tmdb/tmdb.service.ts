import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('TMDB_BASE_URL')!;
    this.apiKey = this.configService.get<string>('TMDB_ACCESS_TOKEN')!;
  }

  async get<T>(
    endpoint: string,
    params: Record<string, any> = {},
    ttl?: number,
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(endpoint, params);

    try {
      const cachedData = await this.cacheManager.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    } catch (error) {
      this.logger.warn(`Cache lookup failed for ${cacheKey}: ${error.message}. Falling back to API.`);
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      accept: 'application/json',
    };

    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { headers, params }).pipe(
        catchError((error) => {
          this.logger.error(`TMDB Request Failed - ${url}`, error.response?.data || error.message);
          throw new HttpException(
            'Failed to fetch data from TMDb',
            HttpStatus.BAD_GATEWAY,
          );
        }),
      ),
    );

    try {
      await this.cacheManager.set(cacheKey, data, ttl);
    } catch (error) {
      this.logger.warn(`Failed to save to cache for ${cacheKey}: ${error.message}`);
    }

    return data;
  }

  private generateCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    return `tmdb:${endpoint}${sortedParams ? '?' + sortedParams : ''}`;
  }
}
