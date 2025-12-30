import { Injectable, Inject } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { ListEventsDto } from './list-events.dto';

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(dto: ListEventsDto): Promise<Event[]> {
    return this.eventRepository.findAll({
      type: dto.type,
      status: dto.status,
    });
  }
}
