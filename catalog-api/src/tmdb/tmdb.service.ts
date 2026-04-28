import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('TMDB_BASE_URL')!;
    this.apiKey = this.configService.get<string>('TMDB_ACCESS_TOKEN')!;
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
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

    return data;
  }
}
