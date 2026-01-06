import { Injectable } from '@nestjs/common';
import {
  EventAttendeeRepository,
  EventAttendeeFindAllFilters,
} from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
import { PaginatedResult } from '../domain/event.repository';

@Injectable()
export class InMemoryEventAttendeeRepository implements EventAttendeeRepository {
  private readonly attendees: Map<string, EventAttendee> = new Map();

  async save(attendee: EventAttendee): Promise<void> {
    await Promise.resolve();
    this.attendees.set(attendee.id, attendee);
  }

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventAttendee | null> {
    await Promise.resolve();
    const attendee = Array.from(this.attendees.values()).find(
      (a) => a.eventId === eventId && a.userId === userId,
    );
    return attendee || null;
  }

  async findByEvent(eventId: string): Promise<EventAttendee[]> {
    await Promise.resolve();
    return Array.from(this.attendees.values()).filter(
      (a) => a.eventId === eventId,
    );
  }

  async findByUser(userId: string): Promise<EventAttendee[]> {
    await Promise.resolve();
    return Array.from(this.attendees.values()).filter(
      (a) => a.userId === userId,
    );
  }

  async countByEvent(eventId: string): Promise<number> {
    await Promise.resolve();
    return Array.from(this.attendees.values()).filter(
      (a) => a.eventId === eventId,
    ).length;
  }

  async findAllPaginated(
    filters?: EventAttendeeFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<EventAttendee>> {
    await Promise.resolve();

    let results = Array.from(this.attendees.values());

    // Apply filters
    if (filters?.eventId) {
      results = results.filter((a) => a.eventId === filters.eventId);
    }

    if (filters?.userId) {
      results = results.filter((a) => a.userId === filters.userId);
    }

    if (filters?.status) {
      results = results.filter((a) => {
        const props = (a as any).props;
        return props.status === filters.status;
      });
    }

    // Sort by RSVP date (most recent first)
    results.sort((a, b) => {
      const aProps = (a as any).props;
      const bProps = (b as any).props;
      return bProps.rsvpDate.getTime() - aProps.rsvpDate.getTime();
    });

    // Paginate
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      total,
    };
  }
}
