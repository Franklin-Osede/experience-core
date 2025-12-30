import { EventType } from '../domain/event-type.enum';
import { EventStatus } from '../domain/event-status.enum';
export declare class ListEventsDto {
    type?: EventType;
    status?: EventStatus;
}
