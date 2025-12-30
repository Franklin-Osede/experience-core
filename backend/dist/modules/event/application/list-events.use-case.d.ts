import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { ListEventsDto } from './list-events.dto';
export declare class ListEventsUseCase {
    private readonly eventRepository;
    constructor(eventRepository: EventRepository);
    execute(dto: ListEventsDto): Promise<Event[]>;
}
