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
exports.CheckInEventUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_attended_event_event_1 = require("../domain/events/user-attended-event.event");
let CheckInEventUseCase = class CheckInEventUseCase {
    attendeeRepository;
    eventEmitter;
    constructor(attendeeRepository, eventEmitter) {
        this.attendeeRepository = attendeeRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(eventId, userId) {
        const attendee = await this.attendeeRepository.findByEventAndUser(eventId, userId);
        if (!attendee) {
            throw new common_1.NotFoundException('RSVP not found. Please RSVP first.');
        }
        try {
            attendee.checkIn();
            await this.attendeeRepository.save(attendee);
            console.log('EMITTING EVENT: user.attended.event');
            this.eventEmitter.emit('user.attended.event', new user_attended_event_event_1.UserAttendedEventEvent(userId, eventId));
            return attendee;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
};
exports.CheckInEventUseCase = CheckInEventUseCase;
exports.CheckInEventUseCase = CheckInEventUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('EventAttendeeRepository')),
    __metadata("design:paramtypes", [Object, event_emitter_1.EventEmitter2])
], CheckInEventUseCase);
//# sourceMappingURL=check-in-event.use-case.js.map