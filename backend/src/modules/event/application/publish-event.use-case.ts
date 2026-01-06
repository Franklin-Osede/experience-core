import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Event } from '../domain/event.entity';
import { EventRepository } from '../domain/event.repository';
import { UserRole } from '../../identity/domain/user-role.enum';

@Injectable()
export class PublishEventUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(
    eventId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Verify ownership: only the organizer or ADMIN can publish
    const props = event.getProps();
    if (props.organizerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the event organizer can publish this event',
      );
    }

    // This will throw if business rules are violated (e.g., no venue)
    event.publish();

    await this.eventRepository.save(event);

    return event;
  }
}
