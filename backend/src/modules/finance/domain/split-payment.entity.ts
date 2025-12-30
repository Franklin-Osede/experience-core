import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { v4 as uuidv4 } from 'uuid';

export enum SplitPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED', // All shares paid
  FAILED = 'FAILED', // Timeout or failure
}

export interface PayerStatus {
  userId: string;
  amount: Money;
  isPaid: boolean;
  paidAt?: Date;
}

export interface SplitPaymentProps {
  totalAmount: Money;
  reason: string; // e.g., "VIP Table #5"
  payers: PayerStatus[];
  status: SplitPaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class SplitPayment extends Entity<SplitPaymentProps> {
  private constructor(id: string, props: SplitPaymentProps) {
    super(id, props);
  }

  static create(
    totalAmount: Money,
    reason: string,
    userIds: string[],
  ): SplitPayment {
    if (userIds.length === 0) {
      throw new Error('Cannot split payment with 0 users');
    }

    // Logic: Even split initially
    // WARNING: Be careful with cents division (e.g. 100 / 3)
    // For now, simple division, handling remainder in the last person?
    // Or just "Simplified" logic where we don't worry about cents perfectly yet?
    // Better: Money.allocate() logic if we had it.
    // Let's implement a simple "allocate" logic here or assuming Money handles it.
    // Since Money is a VO, I'll calculate numbers.

    const totalCents = totalAmount.amount;
    const count = userIds.length;
    const baseShare = Math.floor(totalCents / count);
    const remainder = totalCents % count;

    const payers: PayerStatus[] = userIds.map((userId, index) => {
      // Distribute remainder to first 'n' users
      const share = index < remainder ? baseShare + 1 : baseShare;
      return {
        userId,
        amount: new Money(share, totalAmount.currency),
        isPaid: false,
      };
    });

    const now = new Date();
    return new SplitPayment(uuidv4(), {
      totalAmount,
      reason,
      payers,
      status: SplitPaymentStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public recordPayment(userId: string): void {
    const payer = this.props.payers.find((p) => p.userId === userId);
    if (!payer) {
      throw new Error('User is not part of this split payment');
    }
    if (payer.isPaid) {
      // Idempotency: Ignore if already paid
      return;
    }

    payer.isPaid = true;
    payer.paidAt = new Date();
    this.props.updatedAt = new Date();

    this.checkCompletion();
  }

  private checkCompletion(): void {
    const allPaid = this.props.payers.every((p) => p.isPaid);
    if (allPaid) {
      this.props.status = SplitPaymentStatus.COMPLETED;
    }
  }

  // Getters
  get status(): SplitPaymentStatus {
    return this.props.status;
  }

  get payers(): PayerStatus[] {
    return this.props.payers;
  }

  /**
   * Reconstructs a SplitPayment entity from persistence data.
   */
  static fromPersistence(
    props: SplitPaymentProps & { id: string },
  ): SplitPayment {
    return new SplitPayment(props.id, props);
  }
}
