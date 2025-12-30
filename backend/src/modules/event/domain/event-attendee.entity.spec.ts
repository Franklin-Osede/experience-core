import { EventAttendee } from './event-attendee.entity';
import { AttendeeStatus } from './attendee-status.enum';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-attendee-uuid',
}));

describe('EventAttendee Entity', () => {
  const validProps = {
    eventId: 'event-123',
    userId: 'user-456',
  };

  describe('Creation', () => {
    it('should create attendee with PENDING status', () => {
      const attendee = EventAttendee.create(validProps);

      expect(attendee.eventId).toBe('event-123');
      expect(attendee.userId).toBe('user-456');
      expect(attendee.status).toBe(AttendeeStatus.PENDING);
      expect(attendee.hasAttended).toBe(false);
    });
  });

  describe('Check-in', () => {
    it('should allow check-in for PENDING attendee', () => {
      const attendee = EventAttendee.create(validProps);

      attendee.checkIn();

      expect(attendee.status).toBe(AttendeeStatus.ATTENDED);
      expect(attendee.hasAttended).toBe(true);
      expect(attendee.checkInDate).toBeDefined();
    });

    it('should throw error if already checked in', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.checkIn();

      expect(() => attendee.checkIn()).toThrow('Already checked in');
    });

    it('should throw error if RSVP was cancelled', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.cancel();

      expect(() => attendee.checkIn()).toThrow(
        'Cannot check-in: RSVP was cancelled',
      );
    });
  });

  describe('Cancellation', () => {
    it('should allow cancellation of PENDING RSVP', () => {
      const attendee = EventAttendee.create(validProps);

      attendee.cancel();

      expect(attendee.status).toBe(AttendeeStatus.CANCELLED);
    });

    it('should throw error if already attended', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.checkIn();

      expect(() => attendee.cancel()).toThrow(
        'Cannot cancel: already attended',
      );
    });

    it('should throw error if already cancelled', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.cancel();

      expect(() => attendee.cancel()).toThrow('Already cancelled');
    });
  });

  describe('No-Show Tracking', () => {
    it('should mark as NO_SHOW if did not attend', () => {
      const attendee = EventAttendee.create(validProps);

      attendee.markAsNoShow();

      expect(attendee.status).toBe(AttendeeStatus.NO_SHOW);
    });

    it('should not mark as NO_SHOW if already attended', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.checkIn();

      attendee.markAsNoShow();

      expect(attendee.status).toBe(AttendeeStatus.ATTENDED);
    });

    it('should not mark as NO_SHOW if was cancelled', () => {
      const attendee = EventAttendee.create(validProps);
      attendee.cancel();

      attendee.markAsNoShow();

      expect(attendee.status).toBe(AttendeeStatus.CANCELLED);
    });
  });
});
