import { Event } from './event.entity';
import { EventType } from './event-type.enum';
import { EventStatus } from './event-status.enum';
import { EventGenre } from './event-genre.enum';

export interface EventFindAllFilters {
  type?: EventType;
  status?: EventStatus;
  genre?: EventGenre;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface EventRepository {
  save(event: Event): Promise<void>;
  findById(id: string): Promise<Event | null>;
  findAll(filters?: {
    type?: EventType;
    status?: EventStatus;
  }): Promise<Event[]>;
  findAllPaginated(
    filters?: EventFindAllFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<Event>>;
}
