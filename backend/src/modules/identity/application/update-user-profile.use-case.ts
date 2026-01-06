import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { UpdateUserProfileDto } from './update-user-profile.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update phone number if provided
    if (dto.phoneNumber !== undefined) {
      user.updatePhoneNumber(dto.phoneNumber);
    }

    // Update preferred genres if provided
    if (dto.preferredGenres !== undefined) {
      user.updatePreferredGenres(dto.preferredGenres);
    }

    await this.userRepository.save(user);

    return user;
  }
}

