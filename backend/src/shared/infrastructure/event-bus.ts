import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DomainEvent } from '../domain/domain-event.interface';

@Injectable()
export class EventBus {
  private eventSubject = new Subject<DomainEvent>();

  publish(event: DomainEvent): void {
    this.eventSubject.next(event);
  }

  subscribe() {
    return this.eventSubject.asObservable();
  }
}
