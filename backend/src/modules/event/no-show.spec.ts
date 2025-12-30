import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event.module';
import { IdentityModule } from '../identity/identity.module';
import { ProcessNoShowDebtUseCase } from './application/process-no-show-debt.use-case';
import { CreateEventUseCase } from './application/create-event.use-case';
import { RsvpEventUseCase } from './application/rsvp-event.use-case';
import { CheckInEventUseCase } from './application/check-in-event.use-case';
import { PublishEventUseCase } from './application/publish-event.use-case';
import { UserRepository } from '../identity/domain/user.repository';
import { User } from '../identity/domain/user.entity';
import { UserRole } from '../identity/domain/user-role.enum';
import { EventType } from './domain/event-type.enum';
import { AttendeeStatus } from './domain/attendee-status.enum';
import { EventAttendee } from './domain/event-attendee.entity';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random(),
}));

describe('No-Show Penalty Logic', () => {
  let moduleRef: TestingModule;
  let processNoShow: ProcessNoShowDebtUseCase;
  let createEvent: CreateEventUseCase;
  let rsvpEvent: RsvpEventUseCase;
  let checkInEvent: CheckInEventUseCase;
  let publishEvent: PublishEventUseCase;
  let userRepo: UserRepository;

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

    processNoShow = moduleRef.get(ProcessNoShowDebtUseCase);
    createEvent = moduleRef.get(CreateEventUseCase);
    rsvpEvent = moduleRef.get(RsvpEventUseCase);
    checkInEvent = moduleRef.get(CheckInEventUseCase);
    publishEvent = moduleRef.get(PublishEventUseCase);
    userRepo = moduleRef.get('UserRepository');
  });

  it('should penalize No-Shows and ignore Checked-In users', async () => {
    // 1. Setup Data
    const organizer = User.create({ email: 'dj@test.com', password: 'pw', role: UserRole.DJ });
    const goodUser = User.create({ email: 'good@test.com', password: 'pw', role: UserRole.FAN });
    const flakeUser = User.create({ email: 'flake@test.com', password: 'pw', role: UserRole.FAN });
    
    // Give flake some rep initially
    flakeUser.increaseReputation(50);
    
    await userRepo.save(organizer);
    await userRepo.save(goodUser);
    await userRepo.save(flakeUser);

    // 2. Create Event
    const event = await createEvent.execute(organizer.id, {
      title: 'Party',
      description: 'Test',
      type: EventType.CLUB_NIGHT,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      location: 'Venue',
      venueId: 'v1',
    });
    await publishEvent.execute(event.id);

    // 3. Both RSVP
    await rsvpEvent.execute(event.id, goodUser.id);
    await rsvpEvent.execute(event.id, flakeUser.id);

    // 4. Good User Checks In
    await checkInEvent.execute(event.id, goodUser.id);

    // 5. Run No-Show Process
    await processNoShow.execute(event.id);

    // 6. Verify Results
    
    // Flake User: Should have Debt and status NO_SHOW
    const updatedFlake = await userRepo.findById(flakeUser.id);
    expect(updatedFlake!.outstandingDebt.amount).toBe(1000); // 10 EUR Penalty
    expect(updatedFlake!.reputationScore).toBe(30); // 50 - 20 = 30

    // Good User: Should have NO Debt
    const updatedGood = await userRepo.findById(goodUser.id);
    expect(updatedGood!.outstandingDebt.amount).toBe(0);
  });

  it('should NOT penalize Excused users', async () => {
    // 1. Setup
    const organizer = User.create({ email: 'dj2@test.com', password: 'pw', role: UserRole.DJ });
    const sickUser = User.create({ email: 'sick@test.com', password: 'pw', role: UserRole.FAN });
    sickUser.increaseReputation(50); // Give them rep to verify it doesn't drop
    await userRepo.save(organizer);
    await userRepo.save(sickUser);

    const event = await createEvent.execute(organizer.id, {
      title: 'Party 2',
      description: 'Test',
      type: EventType.CLUB_NIGHT,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      location: 'Venue',
      venueId: 'v1',
    });
    await publishEvent.execute(event.id);
    await rsvpEvent.execute(event.id, sickUser.id);

    // 2. Mark as EXCUSED (Admin Action simulation)
    // We need to access the attendee directly for this test as we don't have a use case for it yet
    const attendees: EventAttendee[] = await moduleRef.get('EventAttendeeRepository').findByEvent(event.id);
    const sickAttendee = attendees.find((a: EventAttendee) => a.userId === sickUser.id);
    if (sickAttendee) {
        sickAttendee.excuse('Flu');
        await moduleRef.get('EventAttendeeRepository').save(sickAttendee);
    }

    // 3. Process No-Show
    await processNoShow.execute(event.id);

    // 4. Verify NO Debt
    const updatedSick = await userRepo.findById(sickUser.id);
    expect(updatedSick!.outstandingDebt.amount).toBe(0);
    expect(updatedSick!.reputationScore).toBe(50); // No change
  });
});
