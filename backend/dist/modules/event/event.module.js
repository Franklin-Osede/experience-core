"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const common_1 = require("@nestjs/common");
const event_controller_1 = require("./infrastructure/event.controller");
const create_event_use_case_1 = require("./application/create-event.use-case");
const list_events_use_case_1 = require("./application/list-events.use-case");
const publish_event_use_case_1 = require("./application/publish-event.use-case");
const in_memory_event_repository_1 = require("./infrastructure/in-memory-event.repository");
const rsvp_event_use_case_1 = require("./application/rsvp-event.use-case");
const cancel_rsvp_use_case_1 = require("./application/cancel-rsvp.use-case");
const check_in_event_use_case_1 = require("./application/check-in-event.use-case");
const in_memory_event_attendee_repository_1 = require("./infrastructure/in-memory-event-attendee.repository");
let EventModule = class EventModule {
};
exports.EventModule = EventModule;
exports.EventModule = EventModule = __decorate([
    (0, common_1.Module)({
        controllers: [event_controller_1.EventController],
        providers: [
            create_event_use_case_1.CreateEventUseCase,
            list_events_use_case_1.ListEventsUseCase,
            publish_event_use_case_1.PublishEventUseCase,
            rsvp_event_use_case_1.RsvpEventUseCase,
            cancel_rsvp_use_case_1.CancelRsvpUseCase,
            check_in_event_use_case_1.CheckInEventUseCase,
            {
                provide: 'EventRepository',
                useClass: in_memory_event_repository_1.InMemoryEventRepository,
            },
            {
                provide: 'EventAttendeeRepository',
                useClass: in_memory_event_attendee_repository_1.InMemoryEventAttendeeRepository,
            },
        ],
        exports: [],
    })
], EventModule);
//# sourceMappingURL=event.module.js.map