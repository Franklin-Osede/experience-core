import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ServiceListing } from '../domain/service-listing.entity';
import { ServiceListingRepository } from '../domain/provider.repository';
import { Money } from '../../../shared/domain/money.vo';

export interface UpdateServiceListingDto {
  pricePerDayAmount?: number; // in cents
  pricePerDayCurrency?: string;
  isAvailable?: boolean;
}

@Injectable()
export class UpdateServiceListingUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
  ) {}

  async execute(
    providerId: string,
    listingId: string,
    dto: UpdateServiceListingDto,
  ): Promise<ServiceListing> {
    // 1. Get the listing
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new NotFoundException(
        `Service listing with ID ${listingId} not found`,
      );
    }

    // 2. Verify ownership
    if (listing.providerId !== providerId) {
      throw new ForbiddenException(
        'You can only update your own service listings',
      );
    }

    // 3. Update fields
    if (dto.pricePerDayAmount !== undefined && dto.pricePerDayCurrency) {
      const newPrice = new Money(
        dto.pricePerDayAmount,
        dto.pricePerDayCurrency,
      );
      listing.updatePrice(newPrice);
    }

    if (dto.isAvailable !== undefined) {
      if (dto.isAvailable) {
        listing.markAvailable();
      } else {
        listing.markUnavailable();
      }
    }

    // 4. Save
    await this.listingRepository.save(listing);
    return listing;
  }
}
