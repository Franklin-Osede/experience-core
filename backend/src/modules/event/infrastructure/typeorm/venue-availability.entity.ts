import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { AvailabilityStatus } from '../../domain/venue-availability.entity';

/**
 * TypeORM Entity for VenueAvailability persistence
 * Note: venueId references a User with role VENUE
 */
@Entity('venue_availabilities')
@Index(['venueId'])
@Index(['date'])
@Index(['status'])
@Index(['venueId', 'date'], { unique: true }) // One availability per venue per date
@Check(`"minGuaranteeAmount" >= 0`)
export class VenueAvailabilityEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  venueId: string;

  @Column('date')
  date: Date;

  // Min guarantee stored as cents
  @Column({ type: 'bigint' })
  minGuaranteeAmount: number;

  @Column({ length: 3 })
  minGuaranteeCurrency: string;

  @Column('text')
  terms: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.OPEN,
  })
  status: AvailabilityStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationship (venue is a User with role VENUE, using string to avoid circular import)
  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue?: unknown;
}
