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
import { GigApplicationStatus } from '../../domain/gig-application.entity';

/**
 * TypeORM Entity for GigApplication persistence
 */
@Entity('gig_applications')
@Index(['availabilityId'])
@Index(['djId'])
@Index(['status'])
@Index(['availabilityId', 'djId'], { unique: true }) // One application per DJ per availability
export class GigApplicationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  availabilityId: string;

  @Column('uuid')
  djId: string;

  @Column('text')
  proposal: string;

  @Column({
    type: 'enum',
    enum: GigApplicationStatus,
    default: GigApplicationStatus.PENDING,
  })
  status: GigApplicationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationships (using strings to avoid circular imports)
  @ManyToOne('VenueAvailabilityEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'availabilityId' })
  availability?: any;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'djId' })
  dj?: any;
}

