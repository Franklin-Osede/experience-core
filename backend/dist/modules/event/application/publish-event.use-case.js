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
exports.PublishEventUseCase = void 0;
const common_1 = require("@nestjs/common");
let PublishEventUseCase = class PublishEventUseCase {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async execute(eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${eventId} not found`);
        }
        event.publish();
        await this.eventRepository.save(event);
        return event;
    }
};
exports.PublishEventUseCase = PublishEventUseCase;
exports.PublishEventUseCase = PublishEventUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('EventRepository')),
    __metadata("design:paramtypes", [Object])
], PublishEventUseCase);
//# sourceMappingURL=publish-event.use-case.js.map