import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventStatus } from '../domain/event-status.enum';

@Injectable()
export class FundEventUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.isEscrowFunded) {
      throw new BadRequestException('Event is already funded');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Only published events can be funded');
    }

    event.markAsFunded();
    await this.eventRepository.save(event);
  }
}
