import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
export declare class InMemoryEventAttendeeRepository implements EventAttendeeRepository {
    private readonly attendees;
    save(attendee: EventAttendee): Promise<void>;
    findByEventAndUser(eventId: string, userId: string): Promise<EventAttendee | null>;
    findByEvent(eventId: string): Promise<EventAttendee[]>;
    findByUser(userId: string): Promise<EventAttendee[]>;
    countByEvent(eventId: string): Promise<number>;
}
