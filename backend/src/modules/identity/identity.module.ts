import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './infrastructure/user.controller';
import { CreateUserUseCase } from './application/create-user.use-case';
import { GetUserProfileUseCase } from './application/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/update-user-profile.use-case';
import { InviteUserUseCase } from './application/invite-user.use-case';
import { UserAttendedEventListener } from './application/user-attended-event.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserEntity } from './infrastructure/typeorm/user.entity';
import { TypeOrmUserRepository } from './infrastructure/typeorm/user.repository';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';

// Use TypeORM repository in production, in-memory for testing
const useTypeORM = process.env.USE_TYPEORM !== 'false';
const typeOrmImports = useTypeORM
  ? [TypeOrmModule.forFeature([UserEntity])]
  : [];

@Module({
  imports: [EventEmitterModule, ...typeOrmImports],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UserAttendedEventListener,
    {
      provide: 'UserRepository',
      useClass: useTypeORM ? TypeOrmUserRepository : InMemoryUserRepository,
    },
  ],
  exports: ['UserRepository', CreateUserUseCase],
})
export class IdentityModule {}
