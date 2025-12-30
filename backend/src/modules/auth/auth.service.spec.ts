import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../identity/domain/user.repository';
import { User } from '../identity/domain/user.entity';
import { UserRole } from '../identity/domain/user-role.enum';
import * as bcrypt from 'bcrypt';

const mockUserRepository = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'UserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>('UserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if password matches', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email: 'test@test.com',
        role: UserRole.FAN,
        password: hashedPassword,
      });

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test@test.com', password);
      expect(result).toBeDefined();
      expect(result?.email).toBe(user.email);
    });

    it('should return null if password does not match', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email: 'test@test.com',
        role: UserRole.FAN,
        password: hashedPassword,
      });

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('notfound@test.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = {
        email: 'test@test.com',
        id: 'user-id',
        role: UserRole.FAN,
      };
      const result = await service.login(user); // Removed 'as any'
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
    });
  });
});
