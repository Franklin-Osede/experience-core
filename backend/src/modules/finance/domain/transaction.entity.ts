import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { TransactionType } from './transaction-type.enum';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionProps {
  walletId: string;
  amount: Money;
  type: TransactionType;
  referenceId: string; // e.g. EventID or StripePaymentID
  createdAt: Date;
}

export class Transaction extends Entity<TransactionProps> {
  private constructor(id: string, props: TransactionProps) {
    super(id, props);
  }

  static create(
    props: Omit<TransactionProps, 'id' | 'createdAt'>,
  ): Transaction {
    return new Transaction(uuidv4(), {
      ...props,
      createdAt: new Date(),
    });
  }

  get amount(): Money {
    return this.props.amount;
  }
}
