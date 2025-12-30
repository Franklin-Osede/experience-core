import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/user.controller';
import { CreateUserUseCase } from './application/create-user.use-case';
import { InMemoryUserRepository } from './infrastructure/in-memory-user.repository';
import { UserAttendedEventListener } from './application/user-attended-event.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UserAttendedEventListener,
    {
      provide: 'UserRepository',
      useClass: InMemoryUserRepository,
    },
  ],
  exports: ['UserRepository'],
})
export class IdentityModule {}
