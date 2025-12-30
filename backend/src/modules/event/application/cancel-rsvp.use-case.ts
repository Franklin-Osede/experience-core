import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';

@Injectable()
export class CancelRsvpUseCase {
  constructor(
    @Inject('EventAttendeeRepository')
    private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(eventId: string, userId: string): Promise<void> {
    const attendee = await this.attendeeRepository.findByEventAndUser(
      eventId,
      userId,
    );

    if (!attendee) {
      throw new NotFoundException('RSVP not found');
    }

    try {
      attendee.cancel();
      await this.attendeeRepository.save(attendee);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
