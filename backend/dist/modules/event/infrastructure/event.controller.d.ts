import { CreateEventUseCase } from '../application/create-event.use-case';
import { ListEventsUseCase } from '../application/list-events.use-case';
import { PublishEventUseCase } from '../application/publish-event.use-case';
import { RsvpEventUseCase } from '../application/rsvp-event.use-case';
import { CancelRsvpUseCase } from '../application/cancel-rsvp.use-case';
import { CheckInEventUseCase } from '../application/check-in-event.use-case';
import { CreateEventDto } from '../application/create-event.dto';
import { ListEventsDto } from '../application/list-events.dto';
interface AuthenticatedRequest {
    user?: {
        id: string;
    };
}
export declare class EventController {
    private readonly createEventUseCase;
    private readonly listEventsUseCase;
    private readonly publishEventUseCase;
    private readonly rsvpEventUseCase;
    private readonly cancelRsvpUseCase;
    private readonly checkInEventUseCase;
    constructor(createEventUseCase: CreateEventUseCase, listEventsUseCase: ListEventsUseCase, publishEventUseCase: PublishEventUseCase, rsvpEventUseCase: RsvpEventUseCase, cancelRsvpUseCase: CancelRsvpUseCase, checkInEventUseCase: CheckInEventUseCase);
    create(createEventDto: CreateEventDto, req: AuthenticatedRequest): Promise<import("../domain/event.entity").Event>;
    list(listEventsDto: ListEventsDto): Promise<import("../domain/event.entity").Event[]>;
    publish(id: string): Promise<import("../domain/event.entity").Event>;
    rsvp(eventId: string, req: AuthenticatedRequest): Promise<import("../domain/event-attendee.entity").EventAttendee>;
    cancelRsvp(eventId: string, req: AuthenticatedRequest): Promise<void>;
    checkIn(eventId: string, req: AuthenticatedRequest): Promise<import("../domain/event-attendee.entity").EventAttendee>;
}
export {};
