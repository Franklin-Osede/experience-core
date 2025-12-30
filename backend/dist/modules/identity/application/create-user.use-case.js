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
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../domain/user.entity");
const user_created_event_1 = require("../domain/events/user-created.event");
const bcrypt = require("bcrypt");
let CreateUserUseCase = class CreateUserUseCase {
    userRepository;
    eventEmitter;
    constructor(userRepository, eventEmitter) {
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
    }
    async execute(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = user_entity_1.User.create({
            email: dto.email,
            role: dto.role,
            password: hashedPassword,
        });
        await this.userRepository.save(user);
        this.eventEmitter.emit('user.created', new user_created_event_1.UserCreatedEvent(user.id, user.email, user.role));
        return user;
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object, event_emitter_1.EventEmitter2])
], CreateUserUseCase);
//# sourceMappingURL=create-user.use-case.js.map