import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { v4 as uuidv4 } from 'uuid';

export interface WalletProps {
  userId: string;
  balance: Money; // Available funds
  lockedBalance: Money; // Funds in Escrow
  updatedAt: Date;
}

export class Wallet extends Entity<WalletProps> {
  private constructor(id: string, props: WalletProps) {
    super(id, props);
  }

  static create(userId: string): Wallet {
    return new Wallet(uuidv4(), {
      userId,
      balance: new Money(0, 'EUR'),
      lockedBalance: new Money(0, 'EUR'),
      updatedAt: new Date(),
    });
  }

  public deposit(amount: Money): void {
    this.props.balance = this.props.balance.add(amount);
    this.props.updatedAt = new Date();
  }

  public lockFunds(amount: Money): void {
    // Move from Balance to Locked (or add directly to Locked if it comes from external source?)
    // Scenario: User pays, money goes tto Venue Wallet but LOCKED.
    // So we add to Locked Balance directly.
    this.props.lockedBalance = this.props.lockedBalance.add(amount);
    this.props.updatedAt = new Date();
  }

  public releaseFunds(amount: Money): void {
    // Move from Locked to Balance
    this.props.lockedBalance = this.props.lockedBalance.subtract(amount);
    this.props.balance = this.props.balance.add(amount);
    this.props.updatedAt = new Date();
  }

  public withdraw(amount: Money): void {
    if (this.props.balance.amount < amount.amount) {
      throw new Error('Insufficient funds');
    }
    this.props.balance = this.props.balance.subtract(amount);
    this.props.updatedAt = new Date();
  }

  get balance(): Money {
    return this.props.balance;
  }

  get lockedBalance(): Money {
    return this.props.lockedBalance;
  }

  get userId(): string {
    return this.props.userId;
  }
}
