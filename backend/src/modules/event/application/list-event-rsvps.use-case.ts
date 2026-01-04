import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';

@Injectable()
export class ListEventRsvpsUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
    @Inject('EventAttendeeRepository')
    private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(eventId: string): Promise<EventAttendee[]> {
    // Verify event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Get all attendees
    const attendees = await this.attendeeRepository.findByEvent(eventId);

    return attendees;
  }
}
