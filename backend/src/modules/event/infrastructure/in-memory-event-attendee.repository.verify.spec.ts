
import { InMemoryEventAttendeeRepository } from './in-memory-event-attendee.repository';
import { EventAttendee } from '../domain/event-attendee.entity';
import { AttendeeStatus } from '../domain/attendee-status.enum';

describe('InMemoryEventAttendeeRepository Verification', () => {
  let repository: InMemoryEventAttendeeRepository;

  beforeEach(() => {
    repository = new InMemoryEventAttendeeRepository();
  });

  it('should filter by status and sort by rsvpDate correctly after fixes', async () => {
    // Helper to create attendee with specific date (since props are private)
    const createAttendee = (userId: string, date: Date, status: AttendeeStatus) => {
        const attendee = EventAttendee.create({
            eventId: 'event1',
            userId: userId,
        });
        // We have to use any here to setup the test data, but the repository code should NOT use any
        (attendee as any).props.rsvpDate = date;
        (attendee as any).props.status = status;
        return attendee;
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    
    // Create attendees
    const attendee1 = createAttendee('user1', yesterday, AttendeeStatus.PENDING);
    const attendee2 = createAttendee('user2', now, AttendeeStatus.PENDING);
    const attendee3 = createAttendee('user3', now, AttendeeStatus.ATTENDED);

    await repository.save(attendee1);
    await repository.save(attendee2);
    await repository.save(attendee3);

    // Test filtering
    const results = await repository.findAllPaginated({
        eventId: 'event1',
        status: AttendeeStatus.PENDING
    });

    expect(results.data.length).toBe(2);
    
    // Test sorting (most recent first)
    expect(results.data[0].userId).toBe('user2'); // newer
    expect(results.data[1].userId).toBe('user1'); // older
  });
});
