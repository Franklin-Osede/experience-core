import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventStatus } from '../domain/event-status.enum';
// Helper function to safely access entity props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEventProps(event: any): any {
  return event.props;
}

@Injectable()
export class CompleteEventUseCase {
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
      throw new BadRequestException('Event is already completed');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled event');
    }

    if (event.status === EventStatus.DRAFT) {
      throw new BadRequestException('Cannot complete a draft event');
    }

    // Use reflection to set status directly (since there's no complete() method yet)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const props = getEventProps(event);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    props.status = EventStatus.COMPLETED;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    props.updatedAt = new Date();

    await this.eventRepository.save(event);
  }
}
