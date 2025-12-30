import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event.module';
import { IdentityModule } from '../identity/identity.module';
import { PostVenueAvailabilityUseCase } from './application/post-venue-availability.use-case';
import { ApplyToGigUseCase } from './application/apply-to-gig.use-case';
import { AcceptGigApplicationUseCase } from './application/accept-gig-application.use-case';
import {
  VENUE_AVAILABILITY_REPOSITORY,
  VenueAvailabilityRepository,
} from './domain/venue-availability.repository';
import { EventType } from './domain/event-type.enum';
import { AvailabilityStatus } from './domain/venue-availability.entity';
import { GigApplicationStatus } from './domain/gig-application.entity';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random(),
}));

describe('Gig Marketplace Integration', () => {
  let moduleRef: TestingModule;
  let postAvailability: PostVenueAvailabilityUseCase;
  let applyToGig: ApplyToGigUseCase;
  let acceptGig: AcceptGigApplicationUseCase;
  let availabilityRepo: VenueAvailabilityRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot({ global: true }),
        EventModule,
        IdentityModule,
      ],
    }).compile();

    await moduleRef.init();

    postAvailability = moduleRef.get(PostVenueAvailabilityUseCase);
    applyToGig = moduleRef.get(ApplyToGigUseCase);
    acceptGig = moduleRef.get(AcceptGigApplicationUseCase);
    availabilityRepo = moduleRef.get(VENUE_AVAILABILITY_REPOSITORY);
  });

  it('should allow a Venue to post availability and a DJ to book it', async () => {
    // 1. Venue posts openings
    const venueId = 'venue-123';
    const availability = await postAvailability.execute({
      venueId,
      date: new Date(),
      minGuaranteeAmount: 1000,
      minGuaranteeCurrency: 'EUR',
      terms: '50/50 Door Split',
    });

    expect(availability.id).toBeDefined();
    expect(availability.status).toBe(AvailabilityStatus.OPEN);

    // 2. DJ Applies
    const djId = 'dj-cool';
    const application = await applyToGig.execute({
      djId,
      availabilityId: availability.id,
      proposal: 'Deep House Vibes',
    });

    expect(application.id).toBeDefined();
    expect(application.status).toBe(GigApplicationStatus.PENDING);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 1000 * 60 * 60 * 5); // 5 hours later

    // 3. Venue Accepts
    const event = await acceptGig.execute({
      applicationId: application.id,
      eventTitle: 'Deep House Night @ Venue',
      eventType: EventType.CLUB_NIGHT,
      startTime,
      endTime,
    });

    expect(event).toBeDefined();
    expect(event.organizerId).toBe(djId); // Event owner is now the DJ
    expect(event.venueId).toBe(venueId); // Venue is linked

    // 4. Verify Side Effects (Availability Booked)
    const updatedAvailability = await availabilityRepo.findById(
      availability.id,
    );
    expect(updatedAvailability?.status).toBe(AvailabilityStatus.BOOKED);
  });
});
