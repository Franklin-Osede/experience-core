import { Inject, Injectable } from '@nestjs/common';
import {
  GIG_APPLICATION_REPOSITORY,
  GigApplicationRepository,
} from '../domain/gig-application.repository';
import { GigApplication } from '../domain/gig-application.entity';
import { GigApplicationStatus } from '../domain/gig-application.entity';

interface ListApplicationsFilters {
  availabilityId?: string;
  djId?: string;
  status?: GigApplicationStatus;
}

@Injectable()
export class ListGigApplicationsUseCase {
  constructor(
    @Inject(GIG_APPLICATION_REPOSITORY)
    private readonly repository: GigApplicationRepository,
  ) {}

  async execute(filters?: ListApplicationsFilters): Promise<GigApplication[]> {
    // Use repository pagination (database-level filtering)
    const result = await this.repository.findAllPaginated(
      {
        availabilityId: filters?.availabilityId,
        djId: filters?.djId,
        status: filters?.status,
      },
      1, // page
      1000, // large limit to get all (for backward compatibility)
    );

    return result.data;
  }
}
