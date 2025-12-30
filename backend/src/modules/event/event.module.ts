import { Module } from '@nestjs/common';
import { EventController } from './infrastructure/event.controller';
import { CreateEventUseCase } from './application/create-event.use-case';
import { ListEventsUseCase } from './application/list-events.use-case';
import { PublishEventUseCase } from './application/publish-event.use-case';
import { InMemoryEventRepository } from './infrastructure/in-memory-event.repository';

import { RsvpEventUseCase } from './application/rsvp-event.use-case';
import { CancelRsvpUseCase } from './application/cancel-rsvp.use-case';
import { CheckInEventUseCase } from './application/check-in-event.use-case';
import { InMemoryEventAttendeeRepository } from './infrastructure/in-memory-event-attendee.repository';

@Module({
  controllers: [EventController],
  providers: [
    CreateEventUseCase,
    ListEventsUseCase,
    PublishEventUseCase,
    RsvpEventUseCase,
    CancelRsvpUseCase,
    CheckInEventUseCase,
    {
      provide: 'EventRepository',
      useClass: InMemoryEventRepository,
    },
    {
      provide: 'EventAttendeeRepository',
      useClass: InMemoryEventAttendeeRepository,
    },
  ],
  exports: [],
})
export class EventModule {}
