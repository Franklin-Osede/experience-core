import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GigApplication } from '../../domain/gig-application.entity';
import {
  GigApplicationRepository,
  GigApplicationFindAllFilters,
} from '../../domain/gig-application.repository';
import { GigApplicationEntity } from './gig-application.entity';
import { PaginatedResult } from '../../domain/event.repository';

@Injectable()
export class TypeOrmGigApplicationRepository implements GigApplicationRepository {
  constructor(
    @InjectRepository(GigApplicationEntity)
    private readonly typeOrmRepository: Repository<GigApplicationEntity>,
  ) {}

  async save(application: GigApplication): Promise<void> {
    const entity = this.toEntity(application);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<GigApplication | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByAvailabilityId(
    availabilityId: string,
  ): Promise<GigApplication[]> {
    const entities = await this.typeOrmRepository.find({
      where: { availabilityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<GigApplication[]> {
    const entities = await this.typeOrmRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAllPaginated(
    filters?: GigApplicationFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<GigApplication>> {
    const queryBuilder =
      this.typeOrmRepository.createQueryBuilder('application');

    // Apply filters
    if (filters?.availabilityId) {
      queryBuilder.andWhere('application.availabilityId = :availabilityId', {
        availabilityId: filters.availabilityId,
      });
    }

    if (filters?.djId) {
      queryBuilder.andWhere('application.djId = :djId', {
        djId: filters.djId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('application.status = :status', {
        status: filters.status,
      });
    }

    // Sort by creation date (most recent first)
    queryBuilder.orderBy('application.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities.map((e) => this.toDomain(e)),
      total,
    };
  }

  private toEntity(application: GigApplication): GigApplicationEntity {
    const props = application.getProps();
    const entity = new GigApplicationEntity();
    entity.id = application.id;
    entity.availabilityId = props.availabilityId;
    entity.djId = props.djId;
    entity.proposal = props.proposal;
    entity.status = props.status;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: GigApplicationEntity): GigApplication {
    return GigApplication.fromPersistence({
      id: entity.id,
      availabilityId: entity.availabilityId,
      djId: entity.djId,
      proposal: entity.proposal,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
