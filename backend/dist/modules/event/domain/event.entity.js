"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const entity_base_1 = require("../../../shared/domain/entity.base");
const event_status_enum_1 = require("./event-status.enum");
const uuid_1 = require("uuid");
class Event extends entity_base_1.Entity {
    constructor(id, props) {
        super(id, props);
        this.validateDates();
    }
    static create(props) {
        const now = new Date();
        return new Event((0, uuid_1.v4)(), {
            ...props,
            status: event_status_enum_1.EventStatus.DRAFT,
            isEscrowFunded: false,
            createdAt: now,
            updatedAt: now,
        });
    }
    publish() {
        if (this.props.status !== event_status_enum_1.EventStatus.DRAFT) {
            throw new Error('Event can only be published from DRAFT state.');
        }
        if (!this.props.venueId) {
            throw new Error('Cannot publish an event without a Venue assigned.');
        }
        this.props.status = event_status_enum_1.EventStatus.PUBLISHED;
        this.props.updatedAt = new Date();
    }
    markAsFunded() {
        this.props.isEscrowFunded = true;
        if (this.props.status === event_status_enum_1.EventStatus.PUBLISHED) {
            this.props.status = event_status_enum_1.EventStatus.CONFIRMED;
        }
        this.props.updatedAt = new Date();
    }
    cancel() {
        if (this.props.status === event_status_enum_1.EventStatus.COMPLETED) {
            throw new Error('Cannot cancel a completed event.');
        }
        this.props.status = event_status_enum_1.EventStatus.CANCELLED;
        this.props.updatedAt = new Date();
    }
    validateDates() {
        if (this.props.endTime <= this.props.startTime) {
            throw new Error('End time must be after start time.');
        }
    }
    get title() {
        return this.props.title;
    }
    get type() {
        return this.props.type;
    }
    get status() {
        return this.props.status;
    }
    get isEscrowFunded() {
        return this.props.isEscrowFunded;
    }
    get maxCapacity() {
        return this.props.maxCapacity;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.entity.js.map