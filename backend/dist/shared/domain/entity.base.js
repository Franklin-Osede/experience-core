"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    _id;
    props;
    constructor(id, props) {
        this._id = id;
        this.props = props;
    }
    get id() {
        return this._id;
    }
    equals(object) {
        if (object == null || object == undefined) {
            return false;
        }
        if (this === object) {
            return true;
        }
        if (!isEntity(object)) {
            return false;
        }
        return this._id === object._id;
    }
}
exports.Entity = Entity;
function isEntity(v) {
    return v instanceof Entity;
}
//# sourceMappingURL=entity.base.js.map