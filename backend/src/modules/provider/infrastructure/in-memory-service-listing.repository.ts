import { Injectable } from '@nestjs/common';
import { ServiceListing } from '../domain/service-listing.entity';
import { ServiceListingRepository } from '../domain/provider.repository';
import { ServiceCategory } from '../domain/service-category.enum';

/**
 * In-memory implementation of ServiceListingRepository for testing
 */
@Injectable()
export class InMemoryServiceListingRepository implements ServiceListingRepository {
  private readonly listings: Map<string, ServiceListing> = new Map();

  async save(listing: ServiceListing): Promise<void> {
    await Promise.resolve(); // Simulate async I/O
    this.listings.set(listing.id, listing);
  }

  async findById(id: string): Promise<ServiceListing | null> {
    await Promise.resolve(); // Simulate async I/O
    return this.listings.get(id) || null;
  }

  async search(category?: string): Promise<ServiceListing[]> {
    await Promise.resolve(); // Simulate async I/O

    let results = Array.from(this.listings.values()).filter(
      (listing) => listing.isAvailable,
    );

    if (category) {
      results = results.filter((listing) => listing.category === category);
    }

    return results;
  }

  async findByProviderId(providerId: string): Promise<ServiceListing[]> {
    await Promise.resolve(); // Simulate async I/O

    return Array.from(this.listings.values())
      .filter((listing) => listing.providerId === providerId)
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
}
