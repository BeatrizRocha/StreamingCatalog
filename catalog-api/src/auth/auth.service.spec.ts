import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user exists', async () => {
      mockUserService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(
        service.register({ email: 'test@test.com', password: '123', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and return user without password', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: '123',
        name: 'Test',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@test.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        email: 'test@test.com',
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ email: 'test@test.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken if credentials valid', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login({ email: 'test@test.com', password: '123' });
      expect(result).toEqual({ accessToken: 'token' });
    });
  });
});
