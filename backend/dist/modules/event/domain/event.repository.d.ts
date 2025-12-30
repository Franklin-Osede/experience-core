import { Event } from './event.entity';
import { EventType } from './event-type.enum';
import { EventStatus } from './event-status.enum';
export interface EventRepository {
    save(event: Event): Promise<void>;
    findById(id: string): Promise<Event | null>;
    findAll(filters?: {
        type?: EventType;
        status?: EventStatus;
    }): Promise<Event[]>;
}
