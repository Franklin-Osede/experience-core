import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { CreateEventDto } from './create-event.dto';
export declare class CreateEventUseCase {
    private readonly eventRepository;
    constructor(eventRepository: EventRepository);
    execute(organizerId: string, dto: CreateEventDto): Promise<Event>;
}
