import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event.module';
import { IdentityModule } from '../identity/identity.module';
import { RsvpEventUseCase } from './application/rsvp-event.use-case';
import { UserRepository } from '../identity/domain/user.repository';
import { User } from '../identity/domain/user.entity';
import { UserRole } from '../identity/domain/user-role.enum';
import { Money } from '../../shared/domain/money.vo';
import { CreateEventUseCase } from './application/create-event.use-case';
import { PublishEventUseCase } from './application/publish-event.use-case';
import { EventType } from './domain/event-type.enum';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random(),
}));

describe('RSVP with Debt Logic', () => {
  let moduleRef: TestingModule;
  let rsvpUseCase: RsvpEventUseCase;
  let userRepo: UserRepository;
  let createEventUseCase: CreateEventUseCase;
  let publishEventUseCase: PublishEventUseCase;

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
    userRepo = moduleRef.get('UserRepository');
    createEventUseCase = moduleRef.get(CreateEventUseCase);
    publishEventUseCase = moduleRef.get(PublishEventUseCase);
  });

  it('should BLOCK RSVP if user has outstanding debt', async () => {
    // 1. Create a User with Debt
    const debtor = User.create({
      email: 'debtor@test.com',
      password: 'hashed',
      role: UserRole.FAN,
    });
    debtor.recordDebt(new Money(5000, 'EUR')); // 50 EUR Debt
    await userRepo.save(debtor);

    // 2. Create and Publish an Event
    const organizer = User.create({
      email: 'host@test.com',
      password: 'hashed',
      role: UserRole.DJ,
    });
    await userRepo.save(organizer);

    const event = await createEventUseCase.execute(organizer.id, {
      title: 'Party',
      description: 'Fun',
      type: EventType.CLUB_NIGHT,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(), // +1h
      location: 'Venue',
      venueId: 'v1',
    });
    await publishEventUseCase.execute(event.id, organizer.id, UserRole.DJ);

    // 3. Attempt RSVP
    await expect(rsvpUseCase.execute(event.id, debtor.id)).rejects.toThrow(
      'You have outstanding debt',
    );
  });

  it('should ALLOW RSVP if user has NO debt', async () => {
    // 1. Create a User with NO Debt
    const goodUser = User.create({
      email: 'good@test.com',
      password: 'hashed',
      role: UserRole.FAN,
    });
    await userRepo.save(goodUser);

    // 2. Create Event (Reuse from previous if possible, but simpler to recreate for isolation)
    const organizer = User.create({
      email: 'host2@test.com',
      password: 'hashed',
      role: UserRole.DJ,
    });
    await userRepo.save(organizer);

    const event = await createEventUseCase.execute(organizer.id, {
      title: 'Party 2',
      description: 'Fun',
      type: EventType.CLUB_NIGHT,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(), // +1h
      location: 'Venue',
      venueId: 'v1',
    });
    await publishEventUseCase.execute(event.id, organizer.id, UserRole.DJ);

    // 3. Attempt RSVP
    const attendee = await rsvpUseCase.execute(event.id, goodUser.id);
    expect(attendee).toBeDefined();
  });
});
