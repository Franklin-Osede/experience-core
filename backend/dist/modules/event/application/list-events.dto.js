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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEventsDto = void 0;
const class_validator_1 = require("class-validator");
const event_type_enum_1 = require("../domain/event-type.enum");
const event_status_enum_1 = require("../domain/event-status.enum");
const swagger_1 = require("@nestjs/swagger");
class ListEventsDto {
    type;
    status;
}
exports.ListEventsDto = ListEventsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: event_type_enum_1.EventType, description: 'Filter by event type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(event_type_enum_1.EventType),
    __metadata("design:type", String)
], ListEventsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: event_status_enum_1.EventStatus,
        description: 'Filter by event status',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(event_status_enum_1.EventStatus),
    __metadata("design:type", String)
], ListEventsDto.prototype, "status", void 0);
//# sourceMappingURL=list-events.dto.js.map