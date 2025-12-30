import { Injectable } from '@nestjs/common';
import { GigApplicationRepository } from '../domain/gig-application.repository';
import { GigApplication } from '../domain/gig-application.entity';

@Injectable()
export class InMemoryGigApplicationRepository
  implements GigApplicationRepository
{
  private readonly applications = new Map<string, GigApplication>();

  async save(application: GigApplication): Promise<void> {
    this.applications.set(application.id, application);
  }

  async findById(id: string): Promise<GigApplication | null> {
    return this.applications.get(id) || null;
  }

  async findByAvailabilityId(
    availabilityId: string,
  ): Promise<GigApplication[]> {
    return Array.from(this.applications.values()).filter(
      (a) => a.availabilityId === availabilityId,
    );
  }

  async findAll(): Promise<GigApplication[]> {
    return Array.from(this.applications.values());
  }
}
