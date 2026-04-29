import { Test, TestingModule } from '@nestjs/testing';
import { UserContentService } from './user-content.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContentType, ContentStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UserContentService', () => {
  let service: UserContentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    userContent: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserContentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserContentService>(UserContentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    it('should call prisma.userContent.upsert with correct data', async () => {
      const userId = 1;
      const dto = {
        tmdbId: '123',
        type: ContentType.MOVIE,
        status: ContentStatus.WATCHLIST,
        rating: 5,
        title: 'Inception',
      };

      await service.upsert(userId, dto);

      expect(prisma.userContent.upsert).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_type: {
            userId,
            tmdbId: dto.tmdbId,
            type: dto.type,
          },
        },
        update: {
          status: dto.status,
          rating: dto.rating,
          title: dto.title,
        },
        create: {
          userId,
          tmdbId: dto.tmdbId,
          type: dto.type,
          status: dto.status,
          rating: dto.rating,
          title: dto.title,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all content for a user', async () => {
      const userId = 1;
      const expectedResult = [{ id: 1, tmdbId: '123' }];
      mockPrismaService.userContent.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(userId);

      expect(result).toEqual(expectedResult);
      expect(prisma.userContent.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter by status if provided', async () => {
      const userId = 1;
      const status = 'WATCHED';
      await service.findAll(userId, status);

      expect(prisma.userContent.findMany).toHaveBeenCalledWith({
        where: { userId, status },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific record if it exists', async () => {
      const userId = 1;
      const tmdbId = '123';
      const type = ContentType.MOVIE;
      const expectedRecord = { id: 1, tmdbId, type };
      mockPrismaService.userContent.findUnique.mockResolvedValue(expectedRecord);

      const result = await service.findOne(userId, type, tmdbId);

      expect(result).toEqual(expectedRecord);
    });

    it('should throw NotFoundException if record does not exist', async () => {
      mockPrismaService.userContent.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, ContentType.MOVIE, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should call delete with correct where clause', async () => {
      const userId = 1;
      const tmdbId = '123';
      const type = ContentType.MOVIE;

      await service.remove(userId, type, tmdbId);

      expect(prisma.userContent.delete).toHaveBeenCalledWith({
        where: {
          userId_tmdbId_type: {
            userId,
            tmdbId,
            type,
          },
        },
      });
    });
  });
});
