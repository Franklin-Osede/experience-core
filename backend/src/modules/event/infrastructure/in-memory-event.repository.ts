import { Injectable } from '@nestjs/common';
import {
  EventRepository,
  EventFindAllFilters,
  PaginatedResult,
} from '../domain/event.repository';
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

  async findAllPaginated(
    filters?: EventFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<Event>> {
    await Promise.resolve(); // Simulate async I/O

    let results = Array.from(this.events.values());

    // Apply filters (in-memory filtering)
    if (filters?.type) {
      results = results.filter((e) => {
        const props = (e as any).props;
        return props.type === filters.type;
      });
    }

    if (filters?.status) {
      results = results.filter((e) => {
        const props = (e as any).props;
        return props.status === filters.status;
      });
    }

    if (filters?.genre) {
      results = results.filter((e) => {
        const props = (e as any).props;
        return props.genre === filters.genre;
      });
    }

    if (filters?.fromDate) {
      const fromDate = filters.fromDate;
      results = results.filter((e) => {
        const props = (e as any).props;
        return props.startTime >= fromDate;
      });
    }

    if (filters?.toDate) {
      const toDate = filters.toDate;
      results = results.filter((e) => {
        const props = (e as any).props;
        return props.endTime <= toDate;
      });
    }

    // Sort by startTime (upcoming first)
    results.sort((a, b) => {
      const aProps = (a as any).props;
      const bProps = (b as any).props;
      return aProps.startTime.getTime() - bProps.startTime.getTime();
    });

    // Paginate
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      total,
    };
  }
}
