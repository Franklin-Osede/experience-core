import { Injectable } from '@nestjs/common';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';

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
}
