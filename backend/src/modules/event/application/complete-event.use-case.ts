import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventStatus } from '../domain/event-status.enum';
import { UserRole } from '../../identity/domain/user-role.enum';
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

  async execute(
    eventId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Verify ownership: only the organizer or ADMIN can complete
    const props = event.getProps();
    if (props.organizerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the event organizer can complete this event',
      );
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
    const mutableProps = getEventProps(event);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    mutableProps.status = EventStatus.COMPLETED;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    mutableProps.updatedAt = new Date();

    await this.eventRepository.save(event);
  }
}
