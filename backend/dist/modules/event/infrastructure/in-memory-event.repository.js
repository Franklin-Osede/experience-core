"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventRepository = void 0;
const common_1 = require("@nestjs/common");
let InMemoryEventRepository = class InMemoryEventRepository {
    events = new Map();
    async save(event) {
        await Promise.resolve();
        this.events.set(event.id, event);
    }
    async findById(id) {
        await Promise.resolve();
        return this.events.get(id) || null;
    }
    async findAll(filters) {
        await Promise.resolve();
        let results = Array.from(this.events.values());
        if (filters?.type) {
            results = results.filter((e) => e.type === filters.type);
        }
        if (filters?.status) {
            results = results.filter((e) => e.status === filters.status);
        }
        return results;
    }
};
exports.InMemoryEventRepository = InMemoryEventRepository;
exports.InMemoryEventRepository = InMemoryEventRepository = __decorate([
    (0, common_1.Injectable)()
], InMemoryEventRepository);
//# sourceMappingURL=in-memory-event.repository.js.map