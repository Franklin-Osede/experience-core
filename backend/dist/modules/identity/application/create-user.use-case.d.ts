import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from './create-user.dto';
import { User } from '../domain/user.entity';
export declare class CreateUserUseCase {
    private readonly userRepository;
    private readonly eventEmitter;
    constructor(userRepository: UserRepository, eventEmitter: EventEmitter2);
    execute(dto: CreateUserDto): Promise<User>;
}
