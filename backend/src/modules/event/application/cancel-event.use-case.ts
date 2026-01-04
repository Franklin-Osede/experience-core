import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventStatus } from '../domain/event-status.enum';

@Injectable()
export class CancelEventUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed event');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Event is already cancelled');
    }

    event.cancel();
    await this.eventRepository.save(event);
  }
}
