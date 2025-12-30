import { Money } from './money.vo';

describe('Money Value Object', () => {
  it('should create money with correct amount and currency', () => {
    const money = new Money(100, 'EUR');
    expect(money.amount).toBe(100);
    expect(money.currency).toBe('EUR');
  });

  it('should add money correctly', () => {
    const m1 = new Money(100, 'EUR');
    const m2 = new Money(50, 'EUR');
    const result = m1.add(m2);
    expect(result.amount).toBe(150);
  });

  it('should throw error when adding different currencies', () => {
    const m1 = new Money(100, 'EUR');
    const m2 = new Money(50, 'USD');
    expect(() => m1.add(m2)).toThrowError('Currencies do not match');
  });

  it('should subtract money correctly', () => {
    const m1 = new Money(100, 'EUR');
    const m2 = new Money(30, 'EUR');
    const result = m1.subtract(m2);
    expect(result.amount).toBe(70);
  });

  it('should format money correctly', () => {
    const money = new Money(1250, 'EUR'); // 12.50 EUR
    expect(money.toString()).toBe('€12.50');
  });
});
