import { Injectable, Inject } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { CreateEventDto } from './create-event.dto';

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(organizerId: string, dto: CreateEventDto): Promise<Event> {
    const event = Event.create({
      organizerId,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      location: dto.location,
      venueId: dto.venueId,
      maxCapacity: dto.maxCapacity,
    });

    await this.eventRepository.save(event);

    // In a real TDD/DDD flow, we might emit 'EventCreated' here
    return event;
  }
}
