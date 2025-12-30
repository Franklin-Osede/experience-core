import { EventAttendee } from './event-attendee.entity';

export interface EventAttendeeRepository {
  save(attendee: EventAttendee): Promise<void>;
  findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventAttendee | null>;
  findByEvent(eventId: string): Promise<EventAttendee[]>;
  findByUser(userId: string): Promise<EventAttendee[]>;
  countByEvent(eventId: string): Promise<number>;
}
