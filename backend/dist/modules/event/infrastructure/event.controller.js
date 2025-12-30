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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_event_use_case_1 = require("../application/create-event.use-case");
const list_events_use_case_1 = require("../application/list-events.use-case");
const publish_event_use_case_1 = require("../application/publish-event.use-case");
const rsvp_event_use_case_1 = require("../application/rsvp-event.use-case");
const cancel_rsvp_use_case_1 = require("../application/cancel-rsvp.use-case");
const check_in_event_use_case_1 = require("../application/check-in-event.use-case");
const create_event_dto_1 = require("../application/create-event.dto");
const list_events_dto_1 = require("../application/list-events.dto");
let EventController = class EventController {
    createEventUseCase;
    listEventsUseCase;
    publishEventUseCase;
    rsvpEventUseCase;
    cancelRsvpUseCase;
    checkInEventUseCase;
    constructor(createEventUseCase, listEventsUseCase, publishEventUseCase, rsvpEventUseCase, cancelRsvpUseCase, checkInEventUseCase) {
        this.createEventUseCase = createEventUseCase;
        this.listEventsUseCase = listEventsUseCase;
        this.publishEventUseCase = publishEventUseCase;
        this.rsvpEventUseCase = rsvpEventUseCase;
        this.cancelRsvpUseCase = cancelRsvpUseCase;
        this.checkInEventUseCase = checkInEventUseCase;
    }
    async create(createEventDto, req) {
        const userId = req.user?.id || 'mock-organizer-id';
        return this.createEventUseCase.execute(userId, createEventDto);
    }
    async list(listEventsDto) {
        return this.listEventsUseCase.execute(listEventsDto);
    }
    async publish(id) {
        return this.publishEventUseCase.execute(id);
    }
    async rsvp(eventId, req) {
        const userId = req.user?.id || 'mock-attendee-id';
        return this.rsvpEventUseCase.execute(eventId, userId);
    }
    async cancelRsvp(eventId, req) {
        const userId = req.user?.id || 'mock-attendee-id';
        return this.cancelRsvpUseCase.execute(eventId, userId);
    }
    async checkIn(eventId, req) {
        const userId = req.user?.id || 'mock-attendee-id';
        return this.checkInEventUseCase.execute(eventId, userId);
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new draft event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The event has been successfully created.',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List events with optional filters' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns filtered list of events.',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_events_dto_1.ListEventsDto]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a draft event (DRAFT → PUBLISHED)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event successfully published.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Event not found.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot publish (e.g., missing venue).',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/rsvp'),
    (0, swagger_1.ApiOperation)({ summary: 'RSVP to an event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'RSVP confirmed.',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "rsvp", null);
__decorate([
    (0, common_1.Delete)(':id/rsvp'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel RSVP' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'RSVP cancelled.',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "cancelRsvp", null);
__decorate([
    (0, common_1.Post)(':id/check-in'),
    (0, swagger_1.ApiOperation)({ summary: 'Check-in user to event (QR Scan)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User checked in successfully.',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EventController.prototype, "checkIn", null);
exports.EventController = EventController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [create_event_use_case_1.CreateEventUseCase,
        list_events_use_case_1.ListEventsUseCase,
        publish_event_use_case_1.PublishEventUseCase,
        rsvp_event_use_case_1.RsvpEventUseCase,
        cancel_rsvp_use_case_1.CancelRsvpUseCase,
        check_in_event_use_case_1.CheckInEventUseCase])
], EventController);
//# sourceMappingURL=event.controller.js.map