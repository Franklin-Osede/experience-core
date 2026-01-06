import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ServiceCategory } from '../../domain/service-category.enum';

/**
 * TypeORM Entity for ServiceListing persistence
 * This is separate from the domain ServiceListing entity to maintain DDD boundaries
 */
@Entity('service_listings')
@Index(['providerId'])
@Index(['category'])
@Index(['isAvailable'])
export class ServiceListingEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  providerId: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
  })
  category: ServiceCategory;

  @Column({ type: 'bigint' })
  pricePerDayAmount: number; // in cents

  @Column({ length: 3 })
  pricePerDayCurrency: string;

  @Column('jsonb', { nullable: true })
  specs: Record<string, any> | null;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

