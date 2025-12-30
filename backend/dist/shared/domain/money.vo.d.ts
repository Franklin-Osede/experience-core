export declare class Money {
    private readonly _amount;
    private readonly _currency;
    constructor(_amount: number, _currency: string);
    get amount(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Money;
    toString(): string;
    static fromMajor(amount: number, currency: string): Money;
}
