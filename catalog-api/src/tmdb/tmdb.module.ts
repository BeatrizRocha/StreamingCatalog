import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';

import { HttpModule } from '@nestjs/axios';
import { TmdbController } from './tmdb.controller';

@Module({
  imports: [HttpModule],
  providers: [TmdbService],
  exports: [TmdbService],
  controllers: [TmdbController],
})
export class TmdbModule {}
