import { Event } from './event.entity';
import { EventType } from './event-type.enum';
import { EventGenre } from './event-genre.enum';
import { EventStatus } from './event-status.enum';

// Mock uuid to avoid Jest ESM issues with newer versions
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('Event Entity', () => {
  const validProps = {
    organizerId: 'user-123',
    title: 'Sunset Vibes',
    description: 'Best sunset in Valencia',
    type: EventType.HOUSE_DAY,
    genre: EventGenre.HOUSE,
    startTime: new Date('2025-06-20T18:00:00Z'),
    endTime: new Date('2025-06-20T23:00:00Z'),
    location: 'Marina Beach Rooftop',
    venueId: 'venue-123',
    maxCapacity: 100,
  };

  it('should create a valid draft event', () => {
    const event = Event.create(validProps);

    expect(event.title).toBe('Sunset Vibes');
    expect(event.status).toBe(EventStatus.DRAFT);
    expect(event.isEscrowFunded).toBe(false);
  });

  it('should throw error if end time is before start time', () => {
    const invalidProps = {
      ...validProps,
      startTime: new Date('2025-06-20T23:00:00Z'),
      endTime: new Date('2025-06-20T18:00:00Z'),
    };

    expect(() => Event.create(invalidProps)).toThrow(
      'End time must be after start time.',
    );
  });

  it('should be able to publish a draft event with a venue', () => {
    const event = Event.create(validProps);
    event.publish();
    expect(event.status).toBe(EventStatus.PUBLISHED);
  });

  it('should NOT be able to publish an event without a venue', () => {
    const eventNoVenue = Event.create({ ...validProps, venueId: undefined });
    expect(() => eventNoVenue.publish()).toThrow(
      'Cannot publish an event without a Venue assigned.',
    );
  });

  it('should auto-confirm event when funds are secured', () => {
    const event = Event.create(validProps);
    event.publish(); // Now PUBLISHED

    event.markAsFunded(); // Funds secured via Escrow

    expect(event.isEscrowFunded).toBe(true);
    expect(event.status).toBe(EventStatus.CONFIRMED);
  });
});
