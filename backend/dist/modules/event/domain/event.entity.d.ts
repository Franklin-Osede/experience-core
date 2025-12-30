import { Entity } from '../../../shared/domain/entity.base';
import { EventType } from './event-type.enum';
import { EventStatus } from './event-status.enum';
export interface EventProps {
    organizerId: string;
    title: string;
    description: string;
    type: EventType;
    status: EventStatus;
    startTime: Date;
    endTime: Date;
    location: string;
    venueId?: string;
    maxCapacity?: number;
    isEscrowFunded: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Event extends Entity<EventProps> {
    private constructor();
    static create(props: Omit<EventProps, 'id' | 'status' | 'isEscrowFunded' | 'createdAt' | 'updatedAt'>): Event;
    publish(): void;
    markAsFunded(): void;
    cancel(): void;
    private validateDates;
    get title(): string;
    get type(): EventType;
    get status(): EventStatus;
    get isEscrowFunded(): boolean;
    get maxCapacity(): number | undefined;
}
