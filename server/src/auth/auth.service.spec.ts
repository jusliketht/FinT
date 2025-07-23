import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const registerDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        contactNumber: '+1234567890',
        address: '123 Test St',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '2',
        ...registerDto,
        password: hashedPassword,
      };

      const mockToken = 'mock-jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as any);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: '2',
          name: 'New User',
          email: 'newuser@example.com',
          contactNumber: '+1234567890',
          address: '123 Test St',
        },
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });

    it('should throw error when user already exists', async () => {
      const registerDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        contactNumber: '+1234567890',
        address: '123 Test St',
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
        name: 'Existing User',
      };

      mockUsersService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('existing@example.com');
    });

    it('should hash password before creating user', async () => {
      const registerDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        contactNumber: '+1234567890',
        address: '123 Test St',
      };

      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: '2',
        ...registerDto,
        password: hashedPassword,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as any);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });
  });

  describe('validateToken', () => {
    it('should return user when token is valid', async () => {
      const mockToken = 'valid-token';
      const mockPayload = {
        email: 'test@example.com',
        sub: '1',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateToken(mockToken);

      expect(result).toEqual(mockUser);
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when token is invalid', async () => {
      const mockToken = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken(mockToken);

      expect(result).toBeNull();
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('should return null when user is not found', async () => {
      const mockToken = 'valid-token';
      const mockPayload = {
        email: 'test@example.com',
        sub: '1',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersService.findById.mockResolvedValue(null);

      const result = await service.validateToken(mockToken);

      expect(result).toBeNull();
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(mockUsersService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh is successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockToken = 'new-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.refreshToken(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully when current password is correct', async () => {
      const userId = '1';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('oldpassword', 10),
        name: 'Test User',
      };

      const hashedNewPassword = 'hashed-new-password';

      mockUsersService.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedNewPassword as any);
      mockUsersService.updatePassword = jest.fn().mockResolvedValue(true);

      const result = await service.changePassword(userId, currentPassword, newPassword);

      expect(result).toBe(true);
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(userId, hashedNewPassword);
    });

    it('should throw error when current password is incorrect', async () => {
      const userId = '1';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('oldpassword', 10),
        name: 'Test User',
      };

      mockUsersService.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      await expect(service.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'Current password is incorrect'
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
    });

    it('should throw error when user is not found', async () => {
      const userId = '999';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';

      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'User not found'
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and return success message', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.updateResetToken = jest.fn().mockResolvedValue(true);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        message: 'Password reset instructions sent to your email',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUsersService.updateResetToken).toHaveBeenCalledWith(mockUser.id, expect.any(String));
    });

    it('should return success message even when user is not found (security)', async () => {
      const email = 'nonexistent@example.com';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        message: 'Password reset instructions sent to your email',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'newpassword';

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        resetToken: 'valid-reset-token',
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      };

      const hashedNewPassword = 'hashed-new-password';

      mockUsersService.findByResetToken.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedNewPassword as any);
      mockUsersService.updatePassword = jest.fn().mockResolvedValue(true);
      mockUsersService.clearResetToken = jest.fn().mockResolvedValue(true);

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({
        message: 'Password reset successfully',
      });
      expect(mockUsersService.findByResetToken).toHaveBeenCalledWith(token);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(mockUser.id, hashedNewPassword);
      expect(mockUsersService.clearResetToken).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error when reset token is invalid', async () => {
      const token = 'invalid-token';
      const newPassword = 'newpassword';

      mockUsersService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
      expect(mockUsersService.findByResetToken).toHaveBeenCalledWith(token);
    });

    it('should throw error when reset token is expired', async () => {
      const token = 'expired-token';
      const newPassword = 'newpassword';

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        resetToken: 'expired-token',
        resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
      };

      mockUsersService.findByResetToken.mockResolvedValue(mockUser);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
      expect(mockUsersService.findByResetToken).toHaveBeenCalledWith(token);
    });
  });
}); 