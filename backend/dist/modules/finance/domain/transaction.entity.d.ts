import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { TransactionType } from './transaction-type.enum';
export interface TransactionProps {
    walletId: string;
    amount: Money;
    type: TransactionType;
    referenceId: string;
    createdAt: Date;
}
export declare class Transaction extends Entity<TransactionProps> {
    private constructor();
    static create(props: Omit<TransactionProps, 'id' | 'createdAt'>): Transaction;
    get amount(): Money;
}
