import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Event } from '../../domain/event.entity';
import {
  EventRepository,
  EventFindAllFilters,
  PaginatedResult,
} from '../../domain/event.repository';
import { EventEntity } from './event.entity';
import { EventType } from '../../domain/event-type.enum';
import { EventStatus } from '../../domain/event-status.enum';
import { EventGenre } from '../../domain/event-genre.enum';
import { ProductionRider, ProductionRiderProps } from '../../domain/production-rider.vo';

/**
 * TypeORM implementation of EventRepository
 */
@Injectable()
export class TypeOrmEventRepository implements EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly typeOrmRepository: Repository<EventEntity>,
  ) {}

  async save(event: Event): Promise<void> {
    const entity = this.toEntity(event);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<Event | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(filters?: {
    type?: EventType;
    status?: EventStatus;
  }): Promise<Event[]> {
    const where: FindOptionsWhere<EventEntity> = {};
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const entities = await this.typeOrmRepository.find({ where });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAllPaginated(
    filters?: EventFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<Event>> {
    const queryBuilder = this.typeOrmRepository.createQueryBuilder('event');

    // Apply filters
    if (filters?.type) {
      queryBuilder.andWhere('event.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('event.status = :status', { status: filters.status });
    }

    if (filters?.genre) {
      queryBuilder.andWhere('event.genre = :genre', { genre: filters.genre });
    }

    if (filters?.fromDate) {
      queryBuilder.andWhere('event.startTime >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters?.toDate) {
      queryBuilder.andWhere('event.endTime <= :toDate', {
        toDate: filters.toDate,
      });
    }

    // Sort by startTime (upcoming first)
    queryBuilder.orderBy('event.startTime', 'ASC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities.map((entity) => this.toDomain(entity)),
      total,
    };
  }

  private toEntity(event: Event): EventEntity {
    const props = event.getProps();
    const entity = new EventEntity();
    entity.id = event.id;
    entity.organizerId = props.organizerId;
    entity.title = props.title;
    entity.description = props.description;
    entity.type = props.type;
    entity.genre = props.genre;
    entity.status = props.status;
    entity.startTime = props.startTime;
    entity.endTime = props.endTime;
    entity.location = props.location;
    entity.venueId = props.venueId || null;
    entity.maxCapacity = props.maxCapacity || null;
    entity.isEscrowFunded = props.isEscrowFunded;
    entity.productionRider = props.productionRider
      ? props.productionRider.toJSON()
      : null;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: EventEntity): Event {
    return Event.fromPersistence({
      id: entity.id,
      organizerId: entity.organizerId,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      genre: entity.genre,
      status: entity.status,
      startTime: entity.startTime,
      endTime: entity.endTime,
      location: entity.location,
      venueId: entity.venueId || undefined,
      maxCapacity: entity.maxCapacity || undefined,
      productionRider: entity.productionRider
        ? new ProductionRider(entity.productionRider as ProductionRiderProps)
        : undefined,
      isEscrowFunded: entity.isEscrowFunded,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
