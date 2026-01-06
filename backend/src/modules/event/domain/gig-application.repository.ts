import { GigApplication, GigApplicationStatus } from './gig-application.entity';
import { PaginatedResult } from './event.repository';

export const GIG_APPLICATION_REPOSITORY = 'GIG_APPLICATION_REPOSITORY';

export interface GigApplicationFindAllFilters {
  availabilityId?: string;
  djId?: string;
  status?: GigApplicationStatus;
}

export interface GigApplicationRepository {
  save(application: GigApplication): Promise<void>;
  findById(id: string): Promise<GigApplication | null>;
  findByAvailabilityId(availabilityId: string): Promise<GigApplication[]>;
  findAll(): Promise<GigApplication[]>;
  findAllPaginated(
    filters?: GigApplicationFindAllFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<GigApplication>>;
}
