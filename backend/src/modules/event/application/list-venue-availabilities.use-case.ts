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
    // For now, return all. In future, implement filtering in repository
    const all = await this.repository.findAll();

    // Simple in-memory filtering (will be moved to repository when using TypeORM)
    let filtered = all;

    if (filters?.venueId) {
      filtered = filtered.filter((a) => a.venueId === filters.venueId);
    }

    if (filters?.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters?.fromDate) {
      filtered = filtered.filter((a) => a.date >= filters.fromDate!);
    }

    if (filters?.toDate) {
      filtered = filtered.filter((a) => a.date <= filters.toDate!);
    }

    return filtered;
  }
}

