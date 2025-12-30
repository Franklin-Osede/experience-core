"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./infrastructure/user.controller");
const create_user_use_case_1 = require("./application/create-user.use-case");
const in_memory_user_repository_1 = require("./infrastructure/in-memory-user.repository");
const user_attended_event_listener_1 = require("./application/user-attended-event.listener");
const event_emitter_1 = require("@nestjs/event-emitter");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule],
        controllers: [user_controller_1.UserController],
        providers: [
            create_user_use_case_1.CreateUserUseCase,
            user_attended_event_listener_1.UserAttendedEventListener,
            {
                provide: 'UserRepository',
                useClass: in_memory_user_repository_1.InMemoryUserRepository,
            },
        ],
        exports: ['UserRepository'],
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map