"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let EventBus = class EventBus {
    eventSubject = new rxjs_1.Subject();
    publish(event) {
        this.eventSubject.next(event);
    }
    subscribe() {
        return this.eventSubject.asObservable();
    }
};
exports.EventBus = EventBus;
exports.EventBus = EventBus = __decorate([
    (0, common_1.Injectable)()
], EventBus);
//# sourceMappingURL=event-bus.js.map