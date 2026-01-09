import { Entity } from '../../../shared/domain/entity.base';
import { Event, EventProps } from '../../../modules/event/domain/event.entity';
import {
  VenueAvailability,
  VenueAvailabilityProps,
} from '../../../modules/event/domain/venue-availability.entity';
import {
  GigApplication,
  GigApplicationProps,
} from '../../../modules/event/domain/gig-application.entity';
import {
  EventAttendee,
  EventAttendeeProps,
} from '../../../modules/event/domain/event-attendee.entity';

/**
 * Helper type to access protected props safely
 */
type EntityWithProps<T> = Entity<T> & {
  props: T;
};

/**
 * Safely access Event props
 */
export function getEventProps(event: Event): EventProps {
  return (event as unknown as EntityWithProps<EventProps>).props;
}

/**
 * Safely access VenueAvailability props
 */
export function getVenueAvailabilityProps(
  availability: VenueAvailability,
): VenueAvailabilityProps {
  return (availability as unknown as EntityWithProps<VenueAvailabilityProps>)
    .props;
}

/**
 * Safely access GigApplication props
 */
export function getGigApplicationProps(
  application: GigApplication,
): GigApplicationProps {
  return (application as unknown as EntityWithProps<GigApplicationProps>).props;
}

/**
 * Safely access EventAttendee props
 */
export function getEventAttendeeProps(
  attendee: EventAttendee,
): EventAttendeeProps {
  return (attendee as unknown as EntityWithProps<EventAttendeeProps>).props;
}
