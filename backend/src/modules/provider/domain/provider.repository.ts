import { ServiceListing } from './service-listing.entity';
import { ServiceBooking } from './service-booking.entity';

export const SERVICE_LISTING_REPOSITORY = 'SERVICE_LISTING_REPOSITORY';
export const SERVICE_BOOKING_REPOSITORY = 'SERVICE_BOOKING_REPOSITORY';

export interface ServiceListingRepository {
  save(listing: ServiceListing): Promise<void>;
  findById(id: string): Promise<ServiceListing | null>;
  search(category?: string): Promise<ServiceListing[]>;
  findByProviderId(providerId: string): Promise<ServiceListing[]>;
}

export interface ServiceBookingRepository {
  save(booking: ServiceBooking): Promise<void>;
  findById(id: string): Promise<ServiceBooking | null>;
  findOverlapping(
    serviceListingId: string,
    start: Date,
    end: Date,
  ): Promise<ServiceBooking[]>;
  findByEventId(eventId: string): Promise<ServiceBooking[]>;
}
