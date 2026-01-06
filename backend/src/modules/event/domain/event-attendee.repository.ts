import { EventAttendee } from './event-attendee.entity';
import { AttendeeStatus } from './attendee-status.enum';
import { PaginatedResult } from './event.repository';

export interface EventAttendeeFindAllFilters {
  eventId?: string;
  userId?: string;
  status?: AttendeeStatus;
}

export interface EventAttendeeRepository {
  save(attendee: EventAttendee): Promise<void>;
  findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventAttendee | null>;
  findByEvent(eventId: string): Promise<EventAttendee[]>;
  findByUser(userId: string): Promise<EventAttendee[]>;
  countByEvent(eventId: string): Promise<number>;
  findAllPaginated(
    filters?: EventAttendeeFindAllFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EventAttendee>>;
}
