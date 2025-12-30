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
exports.UserAttendedEventListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_attended_event_event_1 = require("../../event/domain/events/user-attended-event.event");
let UserAttendedEventListener = class UserAttendedEventListener {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async handle(event) {
        console.log('HANDLING EVENT:', event);
        const user = await this.userRepository.findById(event.userId);
        if (!user) {
            console.warn(`User ${event.userId} not found for event attendance`);
            return;
        }
        console.log('USER FOUND:', user.id);
        user.markEventAttended();
        await this.userRepository.save(user);
        console.log(`User ${event.userId} attended event ${event.eventId}. ` +
            `Invites: ${user.inviteCredits}, Events: ${user.eventsAttended}`);
    }
};
exports.UserAttendedEventListener = UserAttendedEventListener;
__decorate([
    (0, event_emitter_1.OnEvent)('user.attended.event'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_attended_event_event_1.UserAttendedEventEvent]),
    __metadata("design:returntype", Promise)
], UserAttendedEventListener.prototype, "handle", null);
exports.UserAttendedEventListener = UserAttendedEventListener = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object])
], UserAttendedEventListener);
//# sourceMappingURL=user-attended-event.listener.js.map