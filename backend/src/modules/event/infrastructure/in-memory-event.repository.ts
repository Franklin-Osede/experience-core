import { Injectable } from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { Event } from '../domain/event.entity';
import { EventType } from '../domain/event-type.enum';
import { EventStatus } from '../domain/event-status.enum';

@Injectable()
export class InMemoryEventRepository implements EventRepository {
  private readonly events: Map<string, Event> = new Map();

  async save(event: Event): Promise<void> {
    await Promise.resolve(); // Simulate async I/O
    this.events.set(event.id, event);
  }

  async findById(id: string): Promise<Event | null> {
    await Promise.resolve(); // Simulate async I/O
    return this.events.get(id) || null;
  }

  async findAll(filters?: {
    type?: EventType;
    status?: EventStatus;
  }): Promise<Event[]> {
    await Promise.resolve(); // Simulate async I/O

    let results = Array.from(this.events.values());

    if (filters?.type) {
      results = results.filter((e) => e.type === filters.type);
    }

    if (filters?.status) {
      results = results.filter((e) => e.status === filters.status);
    }

    return results;
  }
}
