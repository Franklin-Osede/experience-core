import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './infrastructure/event.controller';
import { GigController } from './infrastructure/gig.controller';
import { CreateEventUseCase } from './application/create-event.use-case';
import { ListEventsUseCase } from './application/list-events.use-case';
import { GetEventUseCase } from './application/get-event.use-case';
import { PublishEventUseCase } from './application/publish-event.use-case';
import { RsvpEventUseCase } from './application/rsvp-event.use-case';
import { CancelRsvpUseCase } from './application/cancel-rsvp.use-case';
import { CheckInEventUseCase } from './application/check-in-event.use-case';
import { FundEventUseCase } from './application/fund-event.use-case';
import { CompleteEventUseCase } from './application/complete-event.use-case';
import { CancelEventUseCase } from './application/cancel-event.use-case';
import { ListEventRsvpsUseCase } from './application/list-event-rsvps.use-case';
import { ListVenueAvailabilitiesUseCase } from './application/list-venue-availabilities.use-case';
import { ListGigApplicationsUseCase } from './application/list-gig-applications.use-case';
import { ProcessNoShowDebtScheduler } from './application/process-no-show-debt.scheduler';
import { PostVenueAvailabilityUseCase } from './application/post-venue-availability.use-case';
import { ApplyToGigUseCase } from './application/apply-to-gig.use-case';
import { AcceptGigApplicationUseCase } from './application/accept-gig-application.use-case';
import { ProcessNoShowDebtUseCase } from './application/process-no-show-debt.use-case';
import { VENUE_AVAILABILITY_REPOSITORY } from './domain/venue-availability.repository';
import { InMemoryVenueAvailabilityRepository } from './infrastructure/in-memory-venue-availability.repository';
import { GIG_APPLICATION_REPOSITORY } from './domain/gig-application.repository';
import { InMemoryGigApplicationRepository } from './infrastructure/in-memory-gig-application.repository';
import { IdentityModule } from '../identity/identity.module';
import { EventEntity } from './infrastructure/typeorm/event.entity';
import { EventAttendeeEntity } from './infrastructure/typeorm/event-attendee.entity';
import { VenueAvailabilityEntity } from './infrastructure/typeorm/venue-availability.entity';
import { GigApplicationEntity } from './infrastructure/typeorm/gig-application.entity';
import { TypeOrmEventRepository } from './infrastructure/typeorm/event.repository';
import { TypeOrmEventAttendeeRepository } from './infrastructure/typeorm/event-attendee.repository';
import { TypeOrmVenueAvailabilityRepository } from './infrastructure/typeorm/venue-availability.repository';
import { TypeOrmGigApplicationRepository } from './infrastructure/typeorm/gig-application.repository';
import { InMemoryEventRepository } from './infrastructure/in-memory-event.repository';
import { InMemoryEventAttendeeRepository } from './infrastructure/in-memory-event-attendee.repository';

// Use TypeORM repository in production, in-memory for testing
const useTypeORM = process.env.USE_TYPEORM !== 'false';
const typeOrmImports = useTypeORM
  ? [
      // Only register TypeORM repositories when using the DB; skip in in-memory mode for tests
      TypeOrmModule.forFeature([
        EventEntity,
        EventAttendeeEntity,
        VenueAvailabilityEntity,
        GigApplicationEntity,
      ]),
    ]
  : [];

@Module({
  imports: [
    IdentityModule,
    ...typeOrmImports,
  ],
  controllers: [EventController, GigController],
  providers: [
    CreateEventUseCase,
    ListEventsUseCase,
    GetEventUseCase,
    PublishEventUseCase,
    RsvpEventUseCase,
    CancelRsvpUseCase,
    CheckInEventUseCase,
    FundEventUseCase,
    CompleteEventUseCase,
    CancelEventUseCase,
    ListEventRsvpsUseCase,
    ListVenueAvailabilitiesUseCase,
    ListGigApplicationsUseCase,
    ProcessNoShowDebtScheduler,
    {
      provide: 'EventRepository',
      useClass: useTypeORM ? TypeOrmEventRepository : InMemoryEventRepository,
    },
    {
      provide: 'EventAttendeeRepository',
      useClass: useTypeORM
        ? TypeOrmEventAttendeeRepository
        : InMemoryEventAttendeeRepository,
    },
    PostVenueAvailabilityUseCase,
    ApplyToGigUseCase,
    AcceptGigApplicationUseCase,
    ProcessNoShowDebtUseCase,
    {
      provide: VENUE_AVAILABILITY_REPOSITORY,
      useClass: useTypeORM
        ? TypeOrmVenueAvailabilityRepository
        : InMemoryVenueAvailabilityRepository,
    },
    {
      provide: GIG_APPLICATION_REPOSITORY,
      useClass: useTypeORM
        ? TypeOrmGigApplicationRepository
        : InMemoryGigApplicationRepository,
    },
  ],
  exports: ['EventRepository'], // Export for use in other modules (e.g., ProviderModule)
})
export class EventModule {}
