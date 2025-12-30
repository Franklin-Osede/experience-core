export class Money {
  constructor(
    private readonly _amount: number,
    private readonly _currency: string,
  ) {
    if (!Number.isInteger(_amount)) {
      throw new Error('Amount must be an integer (cents)');
    }
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Currencies do not match');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error('Currencies do not match');
    }
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Cannot subtract: result would be negative');
    }
    return new Money(result, this._currency);
  }

  toString(): string {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount / 100);
  }

  static fromMajor(amount: number, currency: string): Money {
    return new Money(Math.round(amount * 100), currency);
  }
}
