import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
import { UserAttendedEventEvent } from '../domain/events/user-attended-event.event';

@Injectable()
export class CheckInEventUseCase {
  constructor(
    @Inject('EventAttendeeRepository')
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(eventId: string, userId: string): Promise<EventAttendee> {
    const attendee = await this.attendeeRepository.findByEventAndUser(
      eventId,
      userId,
    );

    if (!attendee) {
      throw new NotFoundException('RSVP not found. Please RSVP first.');
    }

    try {
      attendee.checkIn();
      await this.attendeeRepository.save(attendee);

      console.log('EMITTING EVENT: user.attended.event');
      // Domain Event: User attended event (triggers invite unlock)
      this.eventEmitter.emit(
        'user.attended.event',
        new UserAttendedEventEvent(userId, eventId),
      );

      return attendee;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
