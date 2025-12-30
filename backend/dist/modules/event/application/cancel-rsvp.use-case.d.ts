import { EventAttendeeRepository } from '../domain/event-attendee.repository';
export declare class CancelRsvpUseCase {
    private readonly attendeeRepository;
    constructor(attendeeRepository: EventAttendeeRepository);
    execute(eventId: string, userId: string): Promise<void>;
}
