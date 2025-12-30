import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../identity/domain/user.repository';
// import * as bcrypt from 'bcrypt'; // Removed unused
import { User } from '../identity/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await user.validatePassword(pass))) {
      // In a real app we might strip password here, but Entity is returned
      return user;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: { email: string; id: string; role: string }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
