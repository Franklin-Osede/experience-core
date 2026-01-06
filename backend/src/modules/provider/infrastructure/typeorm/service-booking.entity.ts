import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BookingStatus } from '../../domain/service-booking.entity';

/**
 * TypeORM Entity for ServiceBooking persistence
 * This is separate from the domain ServiceBooking entity to maintain DDD boundaries
 */
@Entity('service_bookings')
@Index(['serviceListingId'])
@Index(['providerId'])
@Index(['eventId'])
@Index(['status'])
export class ServiceBookingEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  serviceListingId: string;

  @Column('uuid')
  providerId: string;

  @Column('uuid')
  eventId: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'bigint' })
  totalCostAmount: number; // in cents

  @Column({ length: 3 })
  totalCostCurrency: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

