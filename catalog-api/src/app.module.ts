import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TmdbModule } from './tmdb/tmdb.module';

import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        TMDB_ACCESS_TOKEN: Joi.string().required(),
        TMDB_BASE_URL: Joi.string().uri().default('https://api.themoviedb.org/3'),
      }),
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    TmdbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
