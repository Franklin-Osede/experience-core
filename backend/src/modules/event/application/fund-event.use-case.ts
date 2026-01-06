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

@Injectable()
export class FundEventUseCase {
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

    // Verify ownership: only the organizer or ADMIN can fund
    const props = event.getProps();
    if (props.organizerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the event organizer can fund this event',
      );
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
