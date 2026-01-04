import { Inject, Injectable } from '@nestjs/common';
import {
  VENUE_AVAILABILITY_REPOSITORY,
  VenueAvailabilityRepository,
} from '../domain/venue-availability.repository';
import { VenueAvailability } from '../domain/venue-availability.entity';
import { Money } from '../../../shared/domain/money.vo';

interface PostAvailabilityDto {
  venueId: string;
  date: Date;
  minGuaranteeAmount: number;
  minGuaranteeCurrency: string;
  terms: string;
}

@Injectable()
export class PostVenueAvailabilityUseCase {
  constructor(
    @Inject(VENUE_AVAILABILITY_REPOSITORY)
    private readonly repository: VenueAvailabilityRepository,
  ) {}

  async execute(dto: PostAvailabilityDto): Promise<VenueAvailability> {
    const availability = VenueAvailability.create({
      venueId: dto.venueId,
      date: dto.date,
      minGuarantee: new Money(dto.minGuaranteeAmount, dto.minGuaranteeCurrency),
      terms: dto.terms,
    });

    await this.repository.save(availability);
    return availability;
  }
}
