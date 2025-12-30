import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from '../domain/event.repository';
import { EventAttendeeRepository } from '../domain/event-attendee.repository';
import { UserRepository } from '../../identity/domain/user.repository';
import { AttendeeStatus } from '../domain/attendee-status.enum';
import { Money } from '../../../shared/domain/money.vo';

@Injectable()
export class ProcessNoShowDebtUseCase {
  constructor(
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
    @Inject('EventAttendeeRepository')
    private readonly attendeeRepository: EventAttendeeRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(eventId: string): Promise<void> {
    // 1. Validate Event
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    // Ensure event is over (allow manual override or check time)
    // For now, assume this is called by a Job that checks dates.

    // 2. Get all attendees
    const attendees = await this.attendeeRepository.findByEvent(eventId);

    // 3. Process No-Shows
    for (const attendee of attendees) {
      // Logic: Attempt to mark as No-Show. The Entity will decide if it's allowed (e.g. checks EXCUSED)
      // We process all non-attended/cancelled users.
      if (
        attendee.status !== AttendeeStatus.ATTENDED &&
        attendee.status !== AttendeeStatus.CANCELLED
      ) {
        attendee.markAsNoShow();
        await this.attendeeRepository.save(attendee);

        // ONLY apply penalty if they were successfully marked as NO_SHOW based on Domain Rules
        if (attendee.status === AttendeeStatus.NO_SHOW) {
          const user = await this.userRepository.findById(attendee.userId);
          if (user) {
            const penaltyAmount = new Money(1000, 'EUR'); // 10.00 EUR
            user.recordDebt(penaltyAmount);
            user.decreaseReputation(20);
            await this.userRepository.save(user);
          }
        }
      }
    }
  }
}
