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
import { EventType } from '../../domain/event-type.enum';
import { EventGenre } from '../../domain/event-genre.enum';
import { EventStatus } from '../../domain/event-status.enum';

/**
 * TypeORM Entity for Event persistence
 */
@Entity('events')
@Index(['organizerId'])
@Index(['status'])
@Index(['startTime'])
@Index(['genre'])
@Index(['venueId'])
@Check(`"endTime" > "startTime"`)
@Check(`"maxCapacity" IS NULL OR "maxCapacity" > 0`)
export class EventEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organizerId: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column({
    type: 'enum',
    enum: EventGenre,
  })
  genre: EventGenre;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column('timestamptz')
  startTime: Date;

  @Column('timestamptz')
  endTime: Date;

  @Column({ length: 500 })
  location: string;

  @Column('uuid', { nullable: true })
  venueId: string | null;

  @Column('int', { nullable: true })
  maxCapacity: number | null;

  @Column({ default: false })
  isEscrowFunded: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationship (using string to avoid circular import)
  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizerId' })
  organizer?: any;
}

