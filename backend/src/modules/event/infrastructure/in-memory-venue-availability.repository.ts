import { Injectable } from '@nestjs/common';
import {
  VenueAvailabilityRepository,
  VenueAvailabilityFindAllFilters,
} from '../domain/venue-availability.repository';
import {
  VenueAvailability,
  AvailabilityStatus,
} from '../domain/venue-availability.entity';
import { PaginatedResult } from '../domain/event.repository';

@Injectable()
export class InMemoryVenueAvailabilityRepository implements VenueAvailabilityRepository {
  private readonly availabilities = new Map<string, VenueAvailability>();

  save(availability: VenueAvailability): Promise<void> {
    this.availabilities.set(availability.id, availability);
    return Promise.resolve();
  }

  findById(id: string): Promise<VenueAvailability | null> {
    return Promise.resolve(this.availabilities.get(id) || null);
  }

  findByVenueId(venueId: string): Promise<VenueAvailability[]> {
    return Promise.resolve(
      Array.from(this.availabilities.values()).filter(
        (a) => a.venueId === venueId,
      ),
    );
  }

  findAllOpen(): Promise<VenueAvailability[]> {
    return Promise.resolve(
      Array.from(this.availabilities.values()).filter(
        (a) => a.status === AvailabilityStatus.OPEN,
      ),
    );
  }

  findAll(): Promise<VenueAvailability[]> {
    return Promise.resolve(Array.from(this.availabilities.values()));
  }

  async findAllPaginated(
    filters?: VenueAvailabilityFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<VenueAvailability>> {
    await Promise.resolve();

    let results = Array.from(this.availabilities.values());

    // Apply filters
    if (filters?.venueId) {
      results = results.filter((a) => a.venueId === filters.venueId);
    }

    if (filters?.status) {
      results = results.filter((a) => a.status === filters.status);
    }

    if (filters?.fromDate) {
      const fromDate = filters.fromDate;
      results = results.filter((a) => {
        const props = (a as any).props;
        return props.date >= fromDate;
      });
    }

    if (filters?.toDate) {
      const toDate = filters.toDate;
      results = results.filter((a) => {
        const props = (a as any).props;
        return props.date <= toDate;
      });
    }

    // Sort by date
    results.sort((a, b) => {
      const aProps = (a as any).props;
      const bProps = (b as any).props;
      return aProps.date.getTime() - bProps.date.getTime();
    });

    // Paginate
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      total,
    };
  }
}
