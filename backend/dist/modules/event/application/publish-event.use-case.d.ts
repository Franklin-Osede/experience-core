import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
export declare class PublishEventUseCase {
    private readonly eventRepository;
    constructor(eventRepository: EventRepository);
    execute(eventId: string): Promise<Event>;
}
