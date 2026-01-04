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

/**
 * TypeORM Entity for SplitPayment Payer (many-to-one with SplitPayment)
 */
@Entity('split_payment_payers')
@Index(['splitPaymentId'])
@Index(['userId'])
@Index(['splitPaymentId', 'userId'], { unique: true }) // One payer record per user per split
@Check(`"amount" > 0`)
export class SplitPaymentPayerEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  splitPaymentId: string;

  @Column('uuid')
  userId: string;

  // Share amount stored as cents
  @Column({ type: 'bigint' })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column('timestamptz', { nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationships (using strings to avoid circular imports)
  @ManyToOne('SplitPaymentEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'splitPaymentId' })
  splitPayment?: any;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: any;
}
