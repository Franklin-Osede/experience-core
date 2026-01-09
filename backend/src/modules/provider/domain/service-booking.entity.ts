import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { v4 as uuidv4 } from 'uuid';

export enum BookingStatus {
  PENDING = 'PENDING', // Requested by Organizer
  CONFIRMED = 'CONFIRMED', // Accepted by Provider
  REJECTED = 'REJECTED', // Denied by Provider
  CANCELLED = 'CANCELLED', // Cancelled by Organizer
  COMPLETED = 'COMPLETED', // Service delivered
}

export interface ServiceBookingProps {
  serviceListingId: string;
  providerId: string; // Redundant but useful for queries
  eventId: string; // The consumer
  startDate: Date;
  endDate: Date;
  totalCost: Money; // Locked price at time of booking
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceBooking extends Entity<ServiceBookingProps> {
  private constructor(id: string, props: ServiceBookingProps) {
    super(id, props);
  }

  static create(
    serviceListingId: string,
    providerId: string,
    eventId: string,
    startDate: Date,
    endDate: Date,
    pricePerDay: Money,
  ): ServiceBooking {
    const id = uuidv4();
    const now = new Date();

    // Calculate duration in days (naive implementation)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Min 1 day

    const totalCost = new Money(
      pricePerDay.amount * diffDays,
      pricePerDay.currency,
    );

    return new ServiceBooking(id, {
      serviceListingId,
      providerId,
      eventId,
      startDate,
      endDate,
      totalCost,
      status: BookingStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public confirm(): void {
    if (this.props.status !== BookingStatus.PENDING) {
      throw new Error('Can only confirm pending bookings');
    }
    this.props.status = BookingStatus.CONFIRMED;
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    if (this.props.status !== BookingStatus.PENDING) {
      throw new Error('Can only reject pending bookings');
    }
    this.props.status = BookingStatus.REJECTED;
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    if (this.props.status !== BookingStatus.CONFIRMED) {
      throw new Error('Can only complete confirmed bookings');
    }
    this.props.status = BookingStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  // Getters for accessing properties
  get serviceListingId(): string {
    return this.props.serviceListingId;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get totalCost(): Money {
    return this.props.totalCost;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Reconstructs a ServiceBooking entity from persistence data
   */
  static fromPersistence(
    props: ServiceBookingProps & { id: string },
  ): ServiceBooking {
    return new ServiceBooking(props.id, {
      serviceListingId: props.serviceListingId,
      providerId: props.providerId,
      eventId: props.eventId,
      startDate: props.startDate,
      endDate: props.endDate,
      totalCost: props.totalCost,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
