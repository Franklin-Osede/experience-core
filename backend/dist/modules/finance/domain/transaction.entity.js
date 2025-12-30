"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const entity_base_1 = require("../../../shared/domain/entity.base");
const uuid_1 = require("uuid");
class Transaction extends entity_base_1.Entity {
    constructor(id, props) {
        super(id, props);
    }
    static create(props) {
        return new Transaction((0, uuid_1.v4)(), {
            ...props,
            createdAt: new Date(),
        });
    }
    get amount() {
        return this.props.amount;
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.entity.js.map