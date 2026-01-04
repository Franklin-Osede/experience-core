import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendeeStatus } from '../../domain/attendee-status.enum';

/**
 * TypeORM Entity for EventAttendee persistence
 */
@Entity('event_attendees')
@Index(['eventId'])
@Index(['userId'])
@Index(['status'])
@Index(['eventId', 'userId'], { unique: true })
export class EventAttendeeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  eventId: string;

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: AttendeeStatus,
    default: AttendeeStatus.PENDING,
  })
  status: AttendeeStatus;

  @Column('timestamptz')
  rsvpDate: Date;

  @Column('timestamptz', { nullable: true })
  checkInDate: Date | null;

  @Column('timestamptz', { nullable: true })
  cancelledDate: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationships (using strings to avoid circular imports)
  @ManyToOne('EventEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event?: unknown;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: unknown;
}
