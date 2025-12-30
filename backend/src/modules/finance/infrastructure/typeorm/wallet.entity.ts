import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

/**
 * TypeORM Entity for Wallet persistence
 */
@Entity('wallets')
@Index(['userId'], { unique: true })
@Check(`"balanceAmount" >= 0`)
@Check(`"lockedBalanceAmount" >= 0`)
export class WalletEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  // Balance stored as cents
  @Column({ type: 'bigint', default: 0 })
  balanceAmount: number;

  @Column({ length: 3, default: 'EUR' })
  balanceCurrency: string;

  // Locked balance (Escrow) stored as cents
  @Column({ type: 'bigint', default: 0 })
  lockedBalanceAmount: number;

  @Column({ length: 3, default: 'EUR' })
  lockedBalanceCurrency: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Foreign key relationship (using string to avoid circular import)
  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: any;
}

