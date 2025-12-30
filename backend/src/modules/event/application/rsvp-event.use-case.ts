import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventRepository } from '../domain/event.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
import { EventStatus } from '../domain/event-status.enum';

import { UserRepository } from '../../identity/domain/user.repository';

@Injectable()
export class RsvpEventUseCase {
  constructor(
    @Inject('EventAttendeeRepository')
    private readonly attendeeRepository: EventAttendeeRepository,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(eventId: string, userId: string): Promise<EventAttendee> {
    // 0. Check User Debt (The Guarantee)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.outstandingDebt.amount > 0) {
      throw new BadRequestException(
        'You have outstanding debt. Please clear it first to RSVP.',
      );
    }

    // 1. Check if event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // 2. Business Rule: Can only RSVP to PUBLISHED or CONFIRMED events
    if (
      event.status !== EventStatus.PUBLISHED &&
      event.status !== EventStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Can only RSVP to published or confirmed events',
      );
    }

    // 3. Check if user already RSVP'd
    const existing = await this.attendeeRepository.findByEventAndUser(
      eventId,
      userId,
    );
    if (existing) {
      throw new ConflictException("You have already RSVP'd to this event");
    }

    // 4. Business Rule: Check capacity (if defined)
    if (event.maxCapacity) {
      const currentCount = await this.attendeeRepository.countByEvent(eventId);
      if (currentCount >= event.maxCapacity) {
        throw new BadRequestException('Event is at full capacity');
      }
    }

    // 5. Create RSVP
    const attendee = EventAttendee.create({
      eventId,
      userId,
    });

    await this.attendeeRepository.save(attendee);

    return attendee;
  }
}
