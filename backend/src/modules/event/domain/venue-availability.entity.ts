import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { v4 as uuidv4 } from 'uuid';

export enum AvailabilityStatus {
  OPEN = 'OPEN',
  NEGOTIATING = 'NEGOTIATING',
  BOOKED = 'BOOKED',
}

export interface VenueAvailabilityProps {
  venueId: string;
  date: Date;
  minGuarantee: Money; // Minimum bar spend required
  terms: string; // e.g. "We provide sound engineer, you bring DJ gear"
  status: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class VenueAvailability extends Entity<VenueAvailabilityProps> {
  private constructor(id: string, props: VenueAvailabilityProps) {
    super(id, props);
  }

  static create(
    props: Omit<
      VenueAvailabilityProps,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): VenueAvailability {
    const now = new Date();
    return new VenueAvailability(uuidv4(), {
      ...props,
      status: AvailabilityStatus.OPEN,
      createdAt: now,
      updatedAt: now,
    });
  }

  public book(): void {
    if (this.props.status !== AvailabilityStatus.OPEN) {
      throw new Error('Availability is not open');
    }
    this.props.status = AvailabilityStatus.BOOKED;
    this.props.updatedAt = new Date();
  }

  // Getters
  get venueId(): string {
    return this.props.venueId;
  }

  get status(): AvailabilityStatus {
    return this.props.status;
  }

  get date(): Date {
    return this.props.date;
  }

  /**
   * Reconstructs a VenueAvailability entity from persistence data.
   */
  static fromPersistence(
    props: VenueAvailabilityProps & { id: string },
  ): VenueAvailability {
    return new VenueAvailability(props.id, props);
  }
}
