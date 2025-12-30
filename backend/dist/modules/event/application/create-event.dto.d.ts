import { EventType } from '../domain/event-type.enum';
export declare class CreateEventDto {
    title: string;
    description: string;
    type: EventType;
    startTime: string;
    endTime: string;
    location: string;
    venueId?: string;
    maxCapacity?: number;
}
