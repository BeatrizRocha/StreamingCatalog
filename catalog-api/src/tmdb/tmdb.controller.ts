import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CACHE_TTLS } from '../common/constants/cache.constants';

@ApiTags('TMDB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) { }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies and series (Cached)' })
  @ApiResponse({ status: 200, description: 'Returns a list of trending content.' })
  getTrending() {
    return this.tmdbService.get('/trending/all/day', { language: 'pt-BR' }, CACHE_TTLS.TRENDING);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for movies or series (Cached)' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Returns a list of search results.' })
  search(@Query('query') query: string) {
    return this.tmdbService.get('/search/multi', { query, language: 'pt-BR' }, CACHE_TTLS.SEARCH);
  }

  @Get('details/:type/:id')
  @ApiOperation({ summary: 'Get details for a specific movie or series (Cached)' })
  @ApiParam({ name: 'type', enum: ['movie', 'tv'], description: 'Media type' })
  @ApiParam({ name: 'id', description: 'Media ID (e.g. 19995)' })
  @ApiResponse({ status: 200, description: 'Returns detailed information.' })
  getDetails(@Param('type') type: string, @Param('id') id: string) {
    return this.tmdbService.get(`/${type}/${id}`, { language: 'pt-BR' }, CACHE_TTLS.DETAILS);
  }
}
