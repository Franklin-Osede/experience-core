import { EventRepository } from '../domain/event.repository';
import { Event } from '../domain/event.entity';
import { EventType } from '../domain/event-type.enum';
import { EventStatus } from '../domain/event-status.enum';
export declare class InMemoryEventRepository implements EventRepository {
    private readonly events;
    save(event: Event): Promise<void>;
    findById(id: string): Promise<Event | null>;
    findAll(filters?: {
        type?: EventType;
        status?: EventStatus;
    }): Promise<Event[]>;
}
