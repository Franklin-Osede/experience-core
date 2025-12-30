"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventAttendeeRepository = void 0;
const common_1 = require("@nestjs/common");
let InMemoryEventAttendeeRepository = class InMemoryEventAttendeeRepository {
    attendees = new Map();
    async save(attendee) {
        await Promise.resolve();
        this.attendees.set(attendee.id, attendee);
    }
    async findByEventAndUser(eventId, userId) {
        await Promise.resolve();
        const attendee = Array.from(this.attendees.values()).find((a) => a.eventId === eventId && a.userId === userId);
        return attendee || null;
    }
    async findByEvent(eventId) {
        await Promise.resolve();
        return Array.from(this.attendees.values()).filter((a) => a.eventId === eventId);
    }
    async findByUser(userId) {
        await Promise.resolve();
        return Array.from(this.attendees.values()).filter((a) => a.userId === userId);
    }
    async countByEvent(eventId) {
        await Promise.resolve();
        return Array.from(this.attendees.values()).filter((a) => a.eventId === eventId).length;
    }
};
exports.InMemoryEventAttendeeRepository = InMemoryEventAttendeeRepository;
exports.InMemoryEventAttendeeRepository = InMemoryEventAttendeeRepository = __decorate([
    (0, common_1.Injectable)()
], InMemoryEventAttendeeRepository);
//# sourceMappingURL=in-memory-event-attendee.repository.js.map