import { DomainEvent } from '../domain/domain-event.interface';
export declare class EventBus {
    private eventSubject;
    publish(event: DomainEvent): void;
    subscribe(): import("rxjs").Observable<DomainEvent>;
}
