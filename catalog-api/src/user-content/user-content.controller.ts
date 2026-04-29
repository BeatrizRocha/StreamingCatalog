import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserContentService } from './user-content.service';
import { CreateUserContentDto } from './dto/create-user-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

@ApiTags('UserContent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-content')
export class UserContentController {
  constructor(private readonly userContentService: UserContentService) {}

  @Post()
  @ApiOperation({ summary: 'Add or update content in user list (Upsert)' })
  upsert(@CurrentUser('id') userId: number, @Body() dto: CreateUserContentDto) {
    return this.userContentService.upsert(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user content with optional status filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (WATCHLIST, WATCHED, DROPPED)' })
  findAll(@CurrentUser('id') userId: number, @Query('status') status?: string) {
    return this.userContentService.findAll(userId, status);
  }

  @Get(':type/:tmdbId')
  @ApiOperation({ summary: 'Check status of a specific content' })
  @ApiParam({ name: 'type', enum: ContentType })
  findOne(
    @CurrentUser('id') userId: number,
    @Param('type') type: ContentType,
    @Param('tmdbId') tmdbId: string,
  ) {
    return this.userContentService.findOne(userId, type, tmdbId);
  }

  @Delete(':type/:tmdbId')
  @ApiOperation({ summary: 'Remove content from user list' })
  @ApiParam({ name: 'type', enum: ContentType })
  remove(
    @CurrentUser('id') userId: number,
    @Param('type') type: ContentType,
    @Param('tmdbId') tmdbId: string,
  ) {
    return this.userContentService.remove(userId, type, tmdbId);
  }
}
