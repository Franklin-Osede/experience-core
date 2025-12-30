"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventAttendee = void 0;
const entity_base_1 = require("../../../shared/domain/entity.base");
const attendee_status_enum_1 = require("./attendee-status.enum");
const uuid_1 = require("uuid");
class EventAttendee extends entity_base_1.Entity {
    constructor(id, props) {
        super(id, props);
    }
    static create(props) {
        const now = new Date();
        return new EventAttendee((0, uuid_1.v4)(), {
            ...props,
            status: attendee_status_enum_1.AttendeeStatus.PENDING,
            rsvpDate: now,
            createdAt: now,
            updatedAt: now,
        });
    }
    checkIn() {
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.CANCELLED) {
            throw new Error('Cannot check-in: RSVP was cancelled');
        }
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.ATTENDED) {
            throw new Error('Already checked in');
        }
        this.props.status = attendee_status_enum_1.AttendeeStatus.ATTENDED;
        this.props.checkInDate = new Date();
        this.props.updatedAt = new Date();
    }
    cancel() {
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.ATTENDED) {
            throw new Error('Cannot cancel: already attended');
        }
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.CANCELLED) {
            throw new Error('Already cancelled');
        }
        this.props.status = attendee_status_enum_1.AttendeeStatus.CANCELLED;
        this.props.cancelledDate = new Date();
        this.props.updatedAt = new Date();
    }
    markAsNoShow() {
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.ATTENDED) {
            return;
        }
        if (this.props.status === attendee_status_enum_1.AttendeeStatus.CANCELLED) {
            return;
        }
        this.props.status = attendee_status_enum_1.AttendeeStatus.NO_SHOW;
        this.props.updatedAt = new Date();
    }
    get eventId() {
        return this.props.eventId;
    }
    get userId() {
        return this.props.userId;
    }
    get status() {
        return this.props.status;
    }
    get hasAttended() {
        return this.props.status === attendee_status_enum_1.AttendeeStatus.ATTENDED;
    }
    get checkInDate() {
        return this.props.checkInDate;
    }
}
exports.EventAttendee = EventAttendee;
//# sourceMappingURL=event-attendee.entity.js.map