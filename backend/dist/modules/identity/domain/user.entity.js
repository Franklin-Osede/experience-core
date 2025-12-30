"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const entity_base_1 = require("../../../shared/domain/entity.base");
const user_role_enum_1 = require("./user-role.enum");
const uuid_1 = require("uuid");
const bcrypt = require("bcrypt");
class User extends entity_base_1.Entity {
    constructor(id, props) {
        super(id, props);
    }
    static create(props) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        let initialInvites;
        let hasUnlockedInvites;
        if (props.role === user_role_enum_1.UserRole.DJ) {
            initialInvites = Infinity;
            hasUnlockedInvites = true;
        }
        else if (props.role === user_role_enum_1.UserRole.FOUNDER) {
            initialInvites = 10;
            hasUnlockedInvites = true;
        }
        else {
            initialInvites = 0;
            hasUnlockedInvites = false;
        }
        return new User(id, {
            ...props,
            isVerified: false,
            reputationScore: 0,
            inviteCredits: initialInvites,
            eventsAttended: 0,
            hasUnlockedInvites,
            createdAt: now,
            updatedAt: now,
        });
    }
    verify() {
        this.props.isVerified = true;
        this.props.updatedAt = new Date();
    }
    markEventAttended() {
        this.props.eventsAttended += 1;
        this.props.updatedAt = new Date();
        if (!this.props.hasUnlockedInvites &&
            this.props.eventsAttended >= 1 &&
            this.props.role === user_role_enum_1.UserRole.FAN) {
            this.unlockInvites();
        }
    }
    unlockInvites() {
        this.props.inviteCredits = 3;
        this.props.hasUnlockedInvites = true;
        this.props.updatedAt = new Date();
    }
    useInvite() {
        if (this.props.inviteCredits === Infinity) {
            return;
        }
        if (this.props.inviteCredits <= 0) {
            throw new Error('No invite credits available');
        }
        this.props.inviteCredits -= 1;
        this.props.updatedAt = new Date();
    }
    increaseReputation(points) {
        this.props.reputationScore += points;
        this.props.updatedAt = new Date();
    }
    decreaseReputation(points) {
        this.props.reputationScore = Math.max(0, this.props.reputationScore - points);
        this.props.updatedAt = new Date();
    }
    async validatePassword(plain) {
        return bcrypt.compare(plain, this.props.password);
    }
    get email() {
        return this.props.email;
    }
    get role() {
        return this.props.role;
    }
    get isVerified() {
        return this.props.isVerified;
    }
    get reputationScore() {
        return this.props.reputationScore;
    }
    get inviteCredits() {
        return this.props.inviteCredits;
    }
    get eventsAttended() {
        return this.props.eventsAttended;
    }
    get hasUnlockedInvites() {
        return this.props.hasUnlockedInvites;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map