import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserAttendedEventEvent } from '../../event/domain/events/user-attended-event.event';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class UserAttendedEventListener {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  @OnEvent('user.attended.event')
  async handle(event: UserAttendedEventEvent): Promise<void> {
    console.log('HANDLING EVENT:', event);
    const user = await this.userRepository.findById(event.userId);

    if (!user) {
      console.warn(`User ${event.userId} not found for event attendance`);
      return;
    }
    console.log('USER FOUND:', user.id);

    // Business Logic: Mark event attended (unlocks invites if first event)
    user.markEventAttended();

    await this.userRepository.save(user);

    console.log(
      `User ${event.userId} attended event ${event.eventId}. ` +
        `Invites: ${user.inviteCredits}, Events: ${user.eventsAttended}`,
    );
  }
}
