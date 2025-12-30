import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
export interface WalletProps {
    userId: string;
    balance: Money;
    lockedBalance: Money;
    updatedAt: Date;
}
export declare class Wallet extends Entity<WalletProps> {
    private constructor();
    static create(userId: string): Wallet;
    deposit(amount: Money): void;
    lockFunds(amount: Money): void;
    releaseFunds(amount: Money): void;
    withdraw(amount: Money): void;
    get balance(): Money;
    get lockedBalance(): Money;
    get userId(): string;
}
