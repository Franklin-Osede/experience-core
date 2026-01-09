import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ServiceListing } from '../domain/service-listing.entity';
import { ServiceListingRepository } from '../domain/provider.repository';
import { UserRepository } from '../../identity/domain/user.repository';
import { UserRole } from '../../identity/domain/user-role.enum';
import { Money } from '../../../shared/domain/money.vo';
import { ServiceCategory } from '../domain/service-category.enum';

export interface CreateServiceListingDto {
  title: string;
  description: string;
  category: ServiceCategory;
  pricePerDayAmount: number; // in cents
  pricePerDayCurrency: string;
  specs?: Record<string, any>;
}

@Injectable()
export class CreateServiceListingUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    providerId: string,
    dto: CreateServiceListingDto,
  ): Promise<ServiceListing> {
    // 1. Verify that the user is a PROVIDER
    const user = await this.userRepository.findById(providerId);
    if (!user || user.role !== UserRole.PROVIDER) {
      throw new ForbiddenException(
        'Only PROVIDERs can create service listings',
      );
    }

    // 2. Create listing
    const listing = ServiceListing.create({
      providerId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      pricePerDay: new Money(dto.pricePerDayAmount, dto.pricePerDayCurrency),
      specs: dto.specs,
    });

    // 3. Save
    await this.listingRepository.save(listing);
    return listing;
  }
}
