"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const entity_base_1 = require("../../../shared/domain/entity.base");
const money_vo_1 = require("../../../shared/domain/money.vo");
const uuid_1 = require("uuid");
class Wallet extends entity_base_1.Entity {
    constructor(id, props) {
        super(id, props);
    }
    static create(userId) {
        return new Wallet((0, uuid_1.v4)(), {
            userId,
            balance: new money_vo_1.Money(0, 'EUR'),
            lockedBalance: new money_vo_1.Money(0, 'EUR'),
            updatedAt: new Date(),
        });
    }
    deposit(amount) {
        this.props.balance = this.props.balance.add(amount);
        this.props.updatedAt = new Date();
    }
    lockFunds(amount) {
        this.props.lockedBalance = this.props.lockedBalance.add(amount);
        this.props.updatedAt = new Date();
    }
    releaseFunds(amount) {
        this.props.lockedBalance = this.props.lockedBalance.subtract(amount);
        this.props.balance = this.props.balance.add(amount);
        this.props.updatedAt = new Date();
    }
    withdraw(amount) {
        if (this.props.balance.amount < amount.amount) {
            throw new Error('Insufficient funds');
        }
        this.props.balance = this.props.balance.subtract(amount);
        this.props.updatedAt = new Date();
    }
    get balance() {
        return this.props.balance;
    }
    get lockedBalance() {
        return this.props.lockedBalance;
    }
    get userId() {
        return this.props.userId;
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.entity.js.map