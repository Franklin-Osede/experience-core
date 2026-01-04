import { Injectable } from '@nestjs/common';
import { VenueAvailabilityRepository } from '../domain/venue-availability.repository';
import {
  VenueAvailability,
  AvailabilityStatus,
} from '../domain/venue-availability.entity';

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
}
