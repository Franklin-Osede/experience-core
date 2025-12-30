import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  LOCK = 'LOCK',
  RELEASE = 'RELEASE',
  SPLIT_PAYMENT = 'SPLIT_PAYMENT',
}

/**
 * TypeORM Entity for Transaction persistence
 */
@Entity('transactions')
@Index(['walletId'])
@Index(['createdAt'])
@Index(['type'])
@Index(['referenceId'])
@Check(`"amount" > 0`)
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  walletId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  // Amount stored as cents
  @Column({ type: 'bigint' })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'uuid' })
  referenceId: string | null; // e.g., eventId, splitPaymentId

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Foreign key relationship (using string to avoid circular import)
  @ManyToOne('WalletEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet?: any;
}

