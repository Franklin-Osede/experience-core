import { Injectable } from '@nestjs/common';
import {
  GigApplicationRepository,
  GigApplicationFindAllFilters,
} from '../domain/gig-application.repository';
import { GigApplication } from '../domain/gig-application.entity';
import { PaginatedResult } from '../domain/event.repository';

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

  async findAllPaginated(
    filters?: GigApplicationFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<GigApplication>> {
    await Promise.resolve();

    let results = Array.from(this.applications.values());

    // Apply filters
    if (filters?.availabilityId) {
      results = results.filter((a) => a.availabilityId === filters.availabilityId);
    }

    if (filters?.djId) {
      results = results.filter((a) => a.djId === filters.djId);
    }

    if (filters?.status) {
      results = results.filter((a) => {
        const props = (a as any).props;
        return props.status === filters.status;
      });
    }

    // Sort by creation date (most recent first)
    results.sort((a, b) => {
      const aProps = (a as any).props;
      const bProps = (b as any).props;
      return bProps.createdAt.getTime() - aProps.createdAt.getTime();
    });

    // Paginate
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      total,
    };
  }
}
