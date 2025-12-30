import { Entity } from '../../../shared/domain/entity.base';
import { AttendeeStatus } from './attendee-status.enum';
export interface EventAttendeeProps {
    eventId: string;
    userId: string;
    status: AttendeeStatus;
    rsvpDate: Date;
    checkInDate?: Date;
    cancelledDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class EventAttendee extends Entity<EventAttendeeProps> {
    private constructor();
    static create(props: Omit<EventAttendeeProps, 'id' | 'status' | 'rsvpDate' | 'createdAt' | 'updatedAt'>): EventAttendee;
    checkIn(): void;
    cancel(): void;
    markAsNoShow(): void;
    get eventId(): string;
    get userId(): string;
    get status(): AttendeeStatus;
    get hasAttended(): boolean;
    get checkInDate(): Date | undefined;
}
