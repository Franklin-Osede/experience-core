import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
export declare class CheckInEventUseCase {
    private readonly attendeeRepository;
    private readonly eventEmitter;
    constructor(attendeeRepository: EventAttendeeRepository, eventEmitter: EventEmitter2);
    execute(eventId: string, userId: string): Promise<EventAttendee>;
}
