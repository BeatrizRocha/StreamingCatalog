import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { UserContentModule } from './user-content/user-content.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        TMDB_ACCESS_TOKEN: Joi.string().required(),
        TMDB_BASE_URL: Joi.string().uri().default('https://api.themoviedb.org/3'),
        REDIS_URL: Joi.string().uri().optional(),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (process.env.NODE_ENV === 'test' || !redisUrl) {
          return {}; // Default in-memory store
        }
        return {
          stores: [new KeyvRedis(redisUrl)],
        };
      },
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    TmdbModule,
    UserContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
