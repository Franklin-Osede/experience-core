"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedEvent = void 0;
class UserCreatedEvent {
    userId;
    email;
    role;
    constructor(userId, email, role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }
}
exports.UserCreatedEvent = UserCreatedEvent;
//# sourceMappingURL=user-created.event.js.map