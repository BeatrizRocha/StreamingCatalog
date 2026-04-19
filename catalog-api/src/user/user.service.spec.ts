import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by email', async () => {
    const user = { id: 1, email: 'test@test.com' };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findByEmail('test@test.com');
    expect(result).toEqual(user);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@test.com' },
    });
  });
});
