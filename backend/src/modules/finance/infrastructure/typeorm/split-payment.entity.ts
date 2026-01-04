import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
  OneToMany,
} from 'typeorm';
import { SplitPaymentStatus } from '../../domain/split-payment.entity';
import { SplitPaymentPayerEntity } from './split-payment-payer.entity';

/**
 * TypeORM Entity for SplitPayment persistence
 */
@Entity('split_payments')
@Index(['status'])
@Index(['createdAt'])
@Check(`"totalAmount" > 0`)
export class SplitPaymentEntity {
  @PrimaryColumn('uuid')
  id: string;

  // Total amount stored as cents
  @Column({ type: 'bigint' })
  totalAmount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ length: 255 })
  reason: string;

  @Column({
    type: 'enum',
    enum: SplitPaymentStatus,
    default: SplitPaymentStatus.PENDING,
  })
  status: SplitPaymentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SplitPaymentPayerEntity, (payer) => payer.splitPayment, {
    cascade: true,
  })
  payers?: SplitPaymentPayerEntity[];
}
