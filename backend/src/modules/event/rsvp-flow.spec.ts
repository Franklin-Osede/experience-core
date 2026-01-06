import { Test, TestingModule } from '@nestjs/testing';

// Mock uuid to avoid Jest ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random(),
}));

import { EventModule } from './event.module';
import { IdentityModule } from '../identity/identity.module';
import { RsvpEventUseCase } from './application/rsvp-event.use-case';
import { CheckInEventUseCase } from './application/check-in-event.use-case';
import { CreateEventUseCase } from './application/create-event.use-case';
import { PublishEventUseCase } from './application/publish-event.use-case';
import { CreateUserUseCase } from '../identity/application/create-user.use-case';
import { UserRepository } from '../identity/domain/user.repository';
import { UserRole } from '../identity/domain/user-role.enum';
import { EventType } from './domain/event-type.enum';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

import { UserAttendedEventListener } from '../identity/application/user-attended-event.listener';

describe('RSVP Flow Integration', () => {
  let rsvpUseCase: RsvpEventUseCase;
  let checkInUseCase: CheckInEventUseCase;
  let createEventUseCase: CreateEventUseCase;
  let publishEventUseCase: PublishEventUseCase;
  let createUserUseCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let moduleRef: TestingModule;

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

    rsvpUseCase = moduleRef.get<RsvpEventUseCase>(RsvpEventUseCase);
    checkInUseCase = moduleRef.get<CheckInEventUseCase>(CheckInEventUseCase);
    createEventUseCase = moduleRef.get<CreateEventUseCase>(CreateEventUseCase);
    publishEventUseCase =
      moduleRef.get<PublishEventUseCase>(PublishEventUseCase);

    // ...

    createUserUseCase = moduleRef.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = moduleRef.get<UserRepository>('UserRepository');

    // Force instantiation of listener to ensure event subscription
    const listener = moduleRef.get<UserAttendedEventListener>(
      UserAttendedEventListener,
    );
    if (!listener) console.error('LISTENER NOT FOUND');
    else console.log('LISTENER FUND');
  });

  it('should unlock invites for a FAN after checking in to their first event', async () => {
    // 1. Create a FAN user (initially 0 invites)
    const user = await createUserUseCase.execute({
      email: 'fan@test.com',
      password: 'password123',
      role: UserRole.FAN,
    });
    expect(user.inviteCredits).toBe(0);

    // 2. Create and Publish an Event
    const draftEvent = await createEventUseCase.execute('organizer-id', {
      title: 'Test Event',
      description: 'Test Description',
      type: EventType.HOUSE_DAY,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(), // +1 day
      location: 'Test Location',
      venueId: 'venue-id',
    });

    await publishEventUseCase.execute(
      draftEvent.id,
      'organizer-id',
      UserRole.DJ,
    );

    // 3. RSVP to the event
    await rsvpUseCase.execute(draftEvent.id, user.id);

    // 4. Check-in to the event
    await checkInUseCase.execute(draftEvent.id, user.id);

    // Give time for the event listener to process (async)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Verify user has unlocked invites
    // We need to fetch the user again to see the updated state
    const updatedUser = await userRepository.findById(user.id);

    expect(updatedUser).toBeDefined();
    if (updatedUser) {
      expect(updatedUser.eventsAttended).toBe(1);
      expect(updatedUser.inviteCredits).toBe(3);
      expect(updatedUser.hasUnlockedInvites).toBe(true);
    }
  });
});
