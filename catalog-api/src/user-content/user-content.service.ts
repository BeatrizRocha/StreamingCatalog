import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserContentDto } from './dto/create-user-content.dto';
import { ContentType } from '@prisma/client';

@Injectable()
export class UserContentService {
  constructor(private prisma: PrismaService) {}

  async upsert(userId: number, dto: CreateUserContentDto) {
    const { tmdbId, type, status, rating, title } = dto;

    return this.prisma.userContent.upsert({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId,
          type,
        },
      },
      update: {
        status,
        rating,
        title,
      },
      create: {
        userId,
        tmdbId,
        type,
        status,
        rating,
        title,
      },
    });
  }

  async findAll(userId: number, status?: string) {
    return this.prisma.userContent.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(userId: number, type: ContentType, tmdbId: string) {
    const content = await this.prisma.userContent.findUnique({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId,
          type,
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found in user list');
    }

    return content;
  }

  async remove(userId: number, type: ContentType, tmdbId: string) {
    return this.prisma.userContent.delete({
      where: {
        userId_tmdbId_type: {
          userId,
          tmdbId,
          type,
        },
      },
    });
  }
}
