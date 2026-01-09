import { Injectable, Inject } from '@nestjs/common';
import { ServiceListing } from '../domain/service-listing.entity';
import { ServiceListingRepository } from '../domain/provider.repository';
import { ServiceCategory } from '../domain/service-category.enum';

export interface ListServiceListingsDto {
  category?: ServiceCategory;
  providerId?: string;
  isAvailable?: boolean;
}

@Injectable()
export class ListServiceListingsUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
  ) {}

  async execute(filters?: ListServiceListingsDto): Promise<ServiceListing[]> {
    // If filtering by provider, use specific method
    if (filters?.providerId) {
      const listings = await this.listingRepository.findByProviderId(
        filters.providerId,
      );
      // Apply additional filters in memory if needed
      return this.applyFilters(listings, filters);
    }

    // Otherwise use search method
    const listings = await this.listingRepository.search(filters?.category);

    return this.applyFilters(listings, filters);
  }

  private applyFilters(
    listings: ServiceListing[],
    filters?: ListServiceListingsDto,
  ): ServiceListing[] {
    let results = listings;

    if (filters?.isAvailable !== undefined) {
      results = results.filter(
        (listing) => listing.isAvailable === filters.isAvailable,
      );
    }

    return results;
  }
}
