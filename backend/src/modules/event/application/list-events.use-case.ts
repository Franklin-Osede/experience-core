import { Injectable, Inject } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { ListEventsDto } from './list-events.dto';
// Helper function to safely access entity props
// This function is needed because Entity.props is protected
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEventProps(event: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return event.props;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(dto: ListEventsDto): Promise<PaginatedResponse<Event>> {
    const page: number = dto.page ?? 1;
    const limit: number = dto.limit ?? 20;

    // Get all events (filtering will be done in repository when TypeORM is fully implemented)
    let events = await this.eventRepository.findAll({
      type: dto.type,
      status: dto.status,
    });

    // Apply additional filters
    if (dto.genre) {
      events = events.filter((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const props = getEventProps(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return props.genre === dto.genre;
      });
    }

    if (dto.fromDate) {
      const from = new Date(dto.fromDate);
      events = events.filter((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const props = getEventProps(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return props.startTime >= from;
      });
    }

    if (dto.toDate) {
      const to = new Date(dto.toDate);
      events = events.filter((e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const props = getEventProps(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return props.endTime <= to;
      });
    }

    // Sort by startTime (upcoming first)
    events.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const aProps = getEventProps(a);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const bProps = getEventProps(b);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const aTime = aProps.startTime.getTime();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const bTime = bProps.startTime.getTime();
      return aTime - bTime;
    });

    // Paginate
    const total = events.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedEvents = events.slice(start, end);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedEvents,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
