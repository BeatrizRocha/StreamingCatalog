import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('TMDB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies and series (Cached)' })
  @ApiResponse({ status: 200, description: 'Returns a list of trending content.' })
  @CacheTTL(1000 * 60 * 60 * 12)
  getTrending() {
    return this.tmdbService.get('/trending/all/day', { language: 'pt-BR' });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for movies or series (Cached)' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Returns a list of search results.' })
  @CacheTTL(1000 * 60 * 5)
  search(@Query('query') query: string) {
    return this.tmdbService.get('/search/multi', { query, language: 'pt-BR' });
  }

  @Get('details/:type/:id')
  @ApiOperation({ summary: 'Get details for a specific movie or series (Cached)' })
  @ApiParam({ name: 'type', enum: ['movie', 'tv'], description: 'Media type' })
  @ApiParam({ name: 'id', description: 'Media ID (e.g. 19995)' })
  @ApiResponse({ status: 200, description: 'Returns detailed information.' })
  @CacheTTL(1000 * 60 * 60 * 24)
  getDetails(@Param('type') type: string, @Param('id') id: string) {
    return this.tmdbService.get(`/${type}/${id}`, { language: 'pt-BR' });
  }
}
