import { Injectable } from '@nestjs/common';
import { GigApplicationRepository } from '../domain/gig-application.repository';
import { GigApplication } from '../domain/gig-application.entity';

@Injectable()
export class InMemoryGigApplicationRepository implements GigApplicationRepository {
  private readonly applications = new Map<string, GigApplication>();

  save(application: GigApplication): Promise<void> {
    this.applications.set(application.id, application);
    return Promise.resolve();
  }

  findById(id: string): Promise<GigApplication | null> {
    return Promise.resolve(this.applications.get(id) || null);
  }

  findByAvailabilityId(availabilityId: string): Promise<GigApplication[]> {
    return Promise.resolve(
      Array.from(this.applications.values()).filter(
        (a) => a.availabilityId === availabilityId,
      ),
    );
  }

  findAll(): Promise<GigApplication[]> {
    return Promise.resolve(Array.from(this.applications.values()));
  }
}
