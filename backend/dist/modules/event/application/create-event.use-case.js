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
exports.CreateEventUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_entity_1 = require("../domain/event.entity");
let CreateEventUseCase = class CreateEventUseCase {
    eventRepository;
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async execute(organizerId, dto) {
        const event = event_entity_1.Event.create({
            organizerId,
            title: dto.title,
            description: dto.description,
            type: dto.type,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            location: dto.location,
            venueId: dto.venueId,
            maxCapacity: dto.maxCapacity,
        });
        await this.eventRepository.save(event);
        return event;
    }
};
exports.CreateEventUseCase = CreateEventUseCase;
exports.CreateEventUseCase = CreateEventUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('EventRepository')),
    __metadata("design:paramtypes", [Object])
], CreateEventUseCase);
//# sourceMappingURL=create-event.use-case.js.map