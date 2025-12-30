"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RsvpEventUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_attendee_entity_1 = require("../domain/event-attendee.entity");
const event_status_enum_1 = require("../domain/event-status.enum");
let RsvpEventUseCase = class RsvpEventUseCase {
    attendeeRepository;
    eventRepository;
    constructor(attendeeRepository, eventRepository) {
        this.attendeeRepository = attendeeRepository;
        this.eventRepository = eventRepository;
    }
    async execute(eventId, userId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${eventId} not found`);
        }
        if (event.status !== event_status_enum_1.EventStatus.PUBLISHED &&
            event.status !== event_status_enum_1.EventStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Can only RSVP to published or confirmed events');
        }
        const existing = await this.attendeeRepository.findByEventAndUser(eventId, userId);
        if (existing) {
            throw new common_1.ConflictException("You have already RSVP'd to this event");
        }
        if (event.maxCapacity) {
            const currentCount = await this.attendeeRepository.countByEvent(eventId);
            if (currentCount >= event.maxCapacity) {
                throw new common_1.BadRequestException('Event is at full capacity');
            }
        }
        const attendee = event_attendee_entity_1.EventAttendee.create({
            eventId,
            userId,
        });
        await this.attendeeRepository.save(attendee);
        return attendee;
    }
};
exports.RsvpEventUseCase = RsvpEventUseCase;
exports.RsvpEventUseCase = RsvpEventUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('EventAttendeeRepository')),
    __param(1, (0, common_1.Inject)('EventRepository')),
    __metadata("design:paramtypes", [Object, Object])
], RsvpEventUseCase);
//# sourceMappingURL=rsvp-event.use-case.js.map