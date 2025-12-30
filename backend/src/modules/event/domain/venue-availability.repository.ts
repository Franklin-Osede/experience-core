import { VenueAvailability } from './venue-availability.entity';

export const VENUE_AVAILABILITY_REPOSITORY = 'VENUE_AVAILABILITY_REPOSITORY';

export interface VenueAvailabilityRepository {
  save(availability: VenueAvailability): Promise<void>;
  findById(id: string): Promise<VenueAvailability | null>;
  findByVenueId(venueId: string): Promise<VenueAvailability[]>;
  findAllOpen(date?: Date): Promise<VenueAvailability[]>;
  findAll(): Promise<VenueAvailability[]>;
}
