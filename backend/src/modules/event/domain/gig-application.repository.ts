import { GigApplication } from './gig-application.entity';

export const GIG_APPLICATION_REPOSITORY = 'GIG_APPLICATION_REPOSITORY';

export interface GigApplicationRepository {
  save(application: GigApplication): Promise<void>;
  findById(id: string): Promise<GigApplication | null>;
  findByAvailabilityId(availabilityId: string): Promise<GigApplication[]>;
  findAll(): Promise<GigApplication[]>;
}
