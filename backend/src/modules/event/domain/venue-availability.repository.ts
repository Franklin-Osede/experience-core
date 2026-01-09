import {
  VenueAvailability,
  AvailabilityStatus,
} from './venue-availability.entity';
import { PaginatedResult } from './event.repository';

export const VENUE_AVAILABILITY_REPOSITORY = 'VENUE_AVAILABILITY_REPOSITORY';

export interface VenueAvailabilityFindAllFilters {
  venueId?: string;
  status?: AvailabilityStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface VenueAvailabilityRepository {
  save(availability: VenueAvailability): Promise<void>;
  findById(id: string): Promise<VenueAvailability | null>;
  findByVenueId(venueId: string): Promise<VenueAvailability[]>;
  findAllOpen(date?: Date): Promise<VenueAvailability[]>;
  findAll(): Promise<VenueAvailability[]>;
  findAllPaginated(
    filters?: VenueAvailabilityFindAllFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<VenueAvailability>>;
}
