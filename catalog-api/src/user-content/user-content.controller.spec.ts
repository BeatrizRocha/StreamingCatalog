import { Test, TestingModule } from '@nestjs/testing';
import { UserContentController } from './user-content.controller';
import { UserContentService } from './user-content.service';
import { ContentType, ContentStatus } from '@prisma/client';
import { CreateUserContentDto } from './dto/create-user-content.dto';

describe('UserContentController', () => {
  let controller: UserContentController;
  let service: UserContentService;

  const mockUserContentService = {
    upsert: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserContentController],
      providers: [
        { provide: UserContentService, useValue: mockUserContentService },
      ],
    }).compile();

    controller = module.get<UserContentController>(UserContentController);
    service = module.get<UserContentService>(UserContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    it('should call service.upsert with correct params', async () => {
      const userId = 1;
      const dto: CreateUserContentDto = {
        tmdbId: '123',
        type: ContentType.MOVIE,
        status: ContentStatus.WATCHLIST,
        title: 'Test Movie',
      };

      await controller.upsert(userId, dto);

      expect(service.upsert).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with correct params', async () => {
      const userId = 1;
      const status = 'WATCHED';

      await controller.findAll(userId, status);

      expect(service.findAll).toHaveBeenCalledWith(userId, status);
    });

    it('should call service.findAll without status if not provided', async () => {
      const userId = 1;

      await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct params', async () => {
      const userId = 1;
      const type = ContentType.TV;
      const tmdbId = '456';

      await controller.findOne(userId, type, tmdbId);

      expect(service.findOne).toHaveBeenCalledWith(userId, type, tmdbId);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct params', async () => {
      const userId = 1;
      const type = ContentType.MOVIE;
      const tmdbId = '789';

      await controller.remove(userId, type, tmdbId);

      expect(service.remove).toHaveBeenCalledWith(userId, type, tmdbId);
    });
  });
});
