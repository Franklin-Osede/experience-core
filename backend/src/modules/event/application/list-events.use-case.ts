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

    // Build filters object
    const filters: {
      type?: any;
      status?: any;
      genre?: any;
      fromDate?: Date;
      toDate?: Date;
    } = {};

    if (dto.type) {
      filters.type = dto.type;
    }
    if (dto.status) {
      filters.status = dto.status;
    }
    if (dto.genre) {
      filters.genre = dto.genre;
    }
    if (dto.fromDate) {
      filters.fromDate = new Date(dto.fromDate);
    }
    if (dto.toDate) {
      filters.toDate = new Date(dto.toDate);
    }

    // Use repository pagination (database-level filtering and pagination)
    const result = await this.eventRepository.findAllPaginated(
      filters,
      page,
      limit,
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
