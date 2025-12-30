import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventRepository } from '../domain/event.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
export declare class RsvpEventUseCase {
    private readonly attendeeRepository;
    private readonly eventRepository;
    constructor(attendeeRepository: EventAttendeeRepository, eventRepository: EventRepository);
    execute(eventId: string, userId: string): Promise<EventAttendee>;
}
