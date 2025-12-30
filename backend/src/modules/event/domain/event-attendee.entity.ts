import { Entity } from '../../../shared/domain/entity.base';
import { AttendeeStatus } from './attendee-status.enum';
import { v4 as uuidv4 } from 'uuid';

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

export class EventAttendee extends Entity<EventAttendeeProps> {
  private constructor(id: string, props: EventAttendeeProps) {
    super(id, props);
  }

  static create(
    props: Omit<
      EventAttendeeProps,
      'id' | 'status' | 'rsvpDate' | 'createdAt' | 'updatedAt'
    >,
  ): EventAttendee {
    const now = new Date();
    return new EventAttendee(uuidv4(), {
      ...props,
      status: AttendeeStatus.PENDING,
      rsvpDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstructs an EventAttendee entity from persistence data
   */
  static fromPersistence(
    props: EventAttendeeProps & { id: string },
  ): EventAttendee {
    return new EventAttendee(props.id, props);
  }

  public checkIn(): void {
    if (this.props.status === AttendeeStatus.CANCELLED) {
      throw new Error('Cannot check-in: RSVP was cancelled');
    }

    if (this.props.status === AttendeeStatus.ATTENDED) {
      throw new Error('Already checked in');
    }

    this.props.status = AttendeeStatus.ATTENDED;
    this.props.checkInDate = new Date();
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status === AttendeeStatus.ATTENDED) {
      throw new Error('Cannot cancel: already attended');
    }

    if (this.props.status === AttendeeStatus.CANCELLED) {
      throw new Error('Already cancelled');
    }

    this.props.status = AttendeeStatus.CANCELLED;
    this.props.cancelledDate = new Date();
    this.props.updatedAt = new Date();
  }

  public markAsNoShow(): void {
    // Called by system after event ends if user didn't check-in
    if (this.props.status === AttendeeStatus.ATTENDED) {
      return; // Already attended, nothing to do
    }

    if (this.props.status === AttendeeStatus.CANCELLED) {
      return; // Was cancelled, not a no-show
    }

    if (this.props.status === AttendeeStatus.EXCUSED) {
      return; // Excused, do not penalize
    }

    this.props.status = AttendeeStatus.NO_SHOW;
    this.props.updatedAt = new Date();
  }

  public excuse(reason: string): void {
    // Admin/Support tool
    this.props.status = AttendeeStatus.EXCUSED;
    this.props.updatedAt = new Date();
    // Logic to store reason log can be added here
    console.log(`Attendee Excused: ${reason}`);
  }

  // Getters
  get eventId(): string {
    return this.props.eventId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): AttendeeStatus {
    return this.props.status;
  }

  get hasAttended(): boolean {
    return this.props.status === AttendeeStatus.ATTENDED;
  }

  get checkInDate(): Date | undefined {
    return this.props.checkInDate;
  }
}
