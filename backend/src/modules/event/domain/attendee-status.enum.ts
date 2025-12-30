export enum AttendeeStatus {
  PENDING = 'PENDING', // RSVP confirmed, waiting for event
  CONFIRMED = 'CONFIRMED', // Payment confirmed (if paid event)
  ATTENDED = 'ATTENDED', // Actually showed up (check-in)
  NO_SHOW = 'NO_SHOW', // RSVP'd but didn't attend
  CANCELLED = 'CANCELLED', // User cancelled RSVP
}
