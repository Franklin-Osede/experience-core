import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ServiceListingRepository } from '../domain/provider.repository';
import { ServiceListing } from '../domain/service-listing.entity';

@Injectable()
export class GetServiceListingUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
  ) {}

  async execute(listingId: string): Promise<ServiceListing> {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundException(
        `Service listing with ID ${listingId} not found`,
      );
    }
    return listing;
  }
}


