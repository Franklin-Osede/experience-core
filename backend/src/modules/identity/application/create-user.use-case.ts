import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from './create-user.dto';
import { User } from '../domain/user.entity';
import { UserCreatedEvent } from '../domain/events/user-created.event';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = User.create({
      email: dto.email,
      role: dto.role,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Publish Domain Event
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.role),
    );

    return user;
  }
}
