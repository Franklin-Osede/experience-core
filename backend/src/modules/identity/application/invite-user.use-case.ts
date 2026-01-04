import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { CreateUserDto } from './create-user.dto';
import { CreateUserUseCase } from './create-user.use-case';

interface InviteUserDto {
  inviterId: string;
  email: string;
  role?: string; // Optional, defaults to FAN
}

@Injectable()
export class InviteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async execute(
    dto: InviteUserDto,
  ): Promise<{ user: User; inviteUsed: boolean }> {
    // 1. Get inviter
    const inviter = await this.userRepository.findById(dto.inviterId);
    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    // 2. Check if inviter has credits
    if (inviter.inviteCredits !== Infinity && inviter.inviteCredits <= 0) {
      throw new BadRequestException('No invite credits available');
    }

    // 3. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 4. Use invite credit (if not Infinity)
    let inviteUsed = false;
    if (inviter.inviteCredits !== Infinity) {
      inviter.useInvite();
      inviteUsed = true;
      await this.userRepository.save(inviter);
    }

    // 5. Create new user (password will be set via email link or temporary password)
    // For MVP, we'll require password in the invite
    // In production, you'd send an invite email with a token
    const createDto: CreateUserDto = {
      email: dto.email,
      role: (dto.role as any) || 'FAN',
      password: 'TEMP_PASSWORD_CHANGE_ME', // In production, generate secure temp password
    };

    const newUser = await this.createUserUseCase.execute(createDto);

    return { user: newUser, inviteUsed };
  }
}
