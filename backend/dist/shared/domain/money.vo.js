"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    _amount;
    _currency;
    constructor(_amount, _currency) {
        this._amount = _amount;
        this._currency = _currency;
        if (!Number.isInteger(_amount)) {
            throw new Error('Amount must be an integer (cents)');
        }
    }
    get amount() {
        return this._amount;
    }
    get currency() {
        return this._currency;
    }
    add(other) {
        if (this._currency !== other._currency) {
            throw new Error('Currencies do not match');
        }
        return new Money(this._amount + other._amount, this._currency);
    }
    subtract(other) {
        if (this._currency !== other._currency) {
            throw new Error('Currencies do not match');
        }
        return new Money(this._amount - other._amount, this._currency);
    }
    toString() {
        return new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: this._currency,
        }).format(this._amount / 100);
    }
    static fromMajor(amount, currency) {
        return new Money(Math.round(amount * 100), currency);
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map