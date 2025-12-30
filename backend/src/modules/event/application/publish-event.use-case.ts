import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';

@Injectable()
export class PublishEventUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // This will throw if business rules are violated (e.g., no venue)
    event.publish();

    await this.eventRepository.save(event);

    return event;
  }
}
