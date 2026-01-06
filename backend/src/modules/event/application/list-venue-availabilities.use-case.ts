import { Inject, Injectable } from '@nestjs/common';
import {
  VENUE_AVAILABILITY_REPOSITORY,
  VenueAvailabilityRepository,
} from '../domain/venue-availability.repository';
import { VenueAvailability } from '../domain/venue-availability.entity';
import { AvailabilityStatus } from '../domain/venue-availability.entity';

interface ListAvailabilitiesFilters {
  venueId?: string;
  status?: AvailabilityStatus;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class ListVenueAvailabilitiesUseCase {
  constructor(
    @Inject(VENUE_AVAILABILITY_REPOSITORY)
    private readonly repository: VenueAvailabilityRepository,
  ) {}

  async execute(
    filters?: ListAvailabilitiesFilters,
  ): Promise<VenueAvailability[]> {
    // Use repository pagination (database-level filtering)
    const result = await this.repository.findAllPaginated(
      {
        venueId: filters?.venueId,
        status: filters?.status,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
      },
      1, // page
      1000, // large limit to get all (for backward compatibility)
    );

    return result.data;
  }
}
