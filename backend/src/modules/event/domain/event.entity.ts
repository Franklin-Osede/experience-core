import { Entity } from '../../../shared/domain/entity.base';
import { EventType } from './event-type.enum';
import { EventStatus } from './event-status.enum';
import { v4 as uuidv4 } from 'uuid';

export interface EventProps {
  organizerId: string; // The "Pro" or "Host"
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  location: string; // Could be a Value Object later (Address)
  venueId?: string; // Optional initially if venue is TBD
  maxCapacity?: number;
  isEscrowFunded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Event extends Entity<EventProps> {
  private constructor(id: string, props: EventProps) {
    super(id, props);
    this.validateDates();
  }

  static create(
    props: Omit<
      EventProps,
      'id' | 'status' | 'isEscrowFunded' | 'createdAt' | 'updatedAt'
    >,
  ): Event {
    const now = new Date();
    return new Event(uuidv4(), {
      ...props,
      status: EventStatus.DRAFT,
      isEscrowFunded: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public publish(): void {
    if (this.props.status !== EventStatus.DRAFT) {
      throw new Error('Event can only be published from DRAFT state.');
    }
    // Business Rule: Can't publish if no venue is selected
    if (!this.props.venueId) {
      throw new Error('Cannot publish an event without a Venue assigned.');
    }

    this.props.status = EventStatus.PUBLISHED;
    this.props.updatedAt = new Date();
  }

  public markAsFunded(): void {
    // This connects to the Finance module implicitly
    this.props.isEscrowFunded = true;

    // Auto-confirm if published? Or separate step?
    // Narrative: "When money is locked, the event is CONFIRMED."
    if (this.props.status === EventStatus.PUBLISHED) {
      this.props.status = EventStatus.CONFIRMED;
    }
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    // We might want to store the cancellation reason in the future: (reason: string)
    if (this.props.status === EventStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed event.');
    }
    this.props.status = EventStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  private validateDates(): void {
    if (this.props.endTime <= this.props.startTime) {
      throw new Error('End time must be after start time.');
    }
  }

  // Getters
  get title(): string {
    return this.props.title;
  }
  get type(): EventType {
    return this.props.type;
  }
  get status(): EventStatus {
    return this.props.status;
  }
  get isEscrowFunded(): boolean {
    return this.props.isEscrowFunded;
  }
  get maxCapacity(): number | undefined {
    return this.props.maxCapacity;
  }
}
