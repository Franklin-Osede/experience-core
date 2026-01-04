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
    // For now, return all. In future, implement filtering in repository
    const all = await this.repository.findAll();

    // Simple in-memory filtering
    let filtered = all;

    if (filters?.availabilityId) {
      filtered = filtered.filter(
        (a) => a.availabilityId === filters.availabilityId,
      );
    }

    if (filters?.djId) {
      filtered = filtered.filter((a) => a.djId === filters.djId);
    }

    if (filters?.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    return filtered;
  }
}
