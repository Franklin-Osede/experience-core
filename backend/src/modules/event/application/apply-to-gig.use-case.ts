import { Inject, Injectable } from '@nestjs/common';
import {
  GIG_APPLICATION_REPOSITORY,
  GigApplicationRepository,
} from '../domain/gig-application.repository';
import {
  VENUE_AVAILABILITY_REPOSITORY,
  VenueAvailabilityRepository,
} from '../domain/venue-availability.repository';
import { GigApplication } from '../domain/gig-application.entity';
import { AvailabilityStatus } from '../domain/venue-availability.entity';

interface ApplyToGigDto {
  djId: string;
  availabilityId: string;
  proposal: string;
}

@Injectable()
export class ApplyToGigUseCase {
  constructor(
    @Inject(GIG_APPLICATION_REPOSITORY)
    private readonly applicationRepository: GigApplicationRepository,
    @Inject(VENUE_AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: VenueAvailabilityRepository,
  ) {}

  async execute(dto: ApplyToGigDto): Promise<GigApplication> {
    // 1. Verify Availability exists and is OPEN
    const availability = await this.availabilityRepository.findById(
      dto.availabilityId,
    );
    if (!availability) {
      throw new Error('Availability not found');
    }
    if (availability.status !== AvailabilityStatus.OPEN) {
      throw new Error('This slot is no longer available');
    }

    // 2. Create Application
    const application = GigApplication.create({
      availabilityId: dto.availabilityId,
      djId: dto.djId,
      proposal: dto.proposal,
    });

    await this.applicationRepository.save(application);
    return application;
  }
}
