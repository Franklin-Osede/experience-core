import { Injectable } from '@nestjs/common';
import { VenueAvailabilityRepository } from '../domain/venue-availability.repository';
import {
  VenueAvailability,
  AvailabilityStatus,
} from '../domain/venue-availability.entity';

@Injectable()
export class InMemoryVenueAvailabilityRepository
  implements VenueAvailabilityRepository
{
  private readonly availabilities = new Map<string, VenueAvailability>();

  async save(availability: VenueAvailability): Promise<void> {
    this.availabilities.set(availability.id, availability);
  }

  async findById(id: string): Promise<VenueAvailability | null> {
    return this.availabilities.get(id) || null;
  }

  async findByVenueId(venueId: string): Promise<VenueAvailability[]> {
    return Array.from(this.availabilities.values()).filter(
      (a) => a.venueId === venueId,
    );
  }

  async findAllOpen(date?: Date): Promise<VenueAvailability[]> {
    return Array.from(this.availabilities.values()).filter(
      (a) => a.status === AvailabilityStatus.OPEN,
    );
  }

  async findAll(): Promise<VenueAvailability[]> {
    return Array.from(this.availabilities.values());
  }
}
