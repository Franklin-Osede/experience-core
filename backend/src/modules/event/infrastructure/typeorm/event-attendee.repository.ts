import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventAttendee } from '../../domain/event-attendee.entity';
import {
  EventAttendeeRepository,
  EventAttendeeFindAllFilters,
} from '../../domain/event-attendee.repository';
import { EventAttendeeEntity } from './event-attendee.entity';
import { PaginatedResult } from '../../domain/event.repository';

/**
 * TypeORM implementation of EventAttendeeRepository
 */
@Injectable()
export class TypeOrmEventAttendeeRepository implements EventAttendeeRepository {
  constructor(
    @InjectRepository(EventAttendeeEntity)
    private readonly typeOrmRepository: Repository<EventAttendeeEntity>,
  ) {}

  async save(attendee: EventAttendee): Promise<void> {
    const entity = this.toEntity(attendee);
    await this.typeOrmRepository.save(entity);
  }

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventAttendee | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { eventId, userId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEvent(eventId: string): Promise<EventAttendee[]> {
    const entities = await this.typeOrmRepository.find({
      where: { eventId },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByUser(userId: string): Promise<EventAttendee[]> {
    const entities = await this.typeOrmRepository.find({
      where: { userId },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async countByEvent(eventId: string): Promise<number> {
    return this.typeOrmRepository.count({ where: { eventId } });
  }

  async findAllPaginated(
    filters?: EventAttendeeFindAllFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<EventAttendee>> {
    const queryBuilder = this.typeOrmRepository.createQueryBuilder('attendee');

    // Apply filters
    if (filters?.eventId) {
      queryBuilder.andWhere('attendee.eventId = :eventId', {
        eventId: filters.eventId,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('attendee.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('attendee.status = :status', {
        status: filters.status,
      });
    }

    // Sort by RSVP date (most recent first)
    queryBuilder.orderBy('attendee.rsvpDate', 'DESC');

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

  private toEntity(attendee: EventAttendee): EventAttendeeEntity {
    const props = attendee.getProps();
    const entity = new EventAttendeeEntity();
    entity.id = attendee.id;
    entity.eventId = props.eventId;
    entity.userId = props.userId;
    entity.status = props.status;
    entity.rsvpDate = props.rsvpDate;
    entity.checkInDate = props.checkInDate || null;
    entity.cancelledDate = props.cancelledDate || null;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: EventAttendeeEntity): EventAttendee {
    return EventAttendee.fromPersistence({
      id: entity.id,
      eventId: entity.eventId,
      userId: entity.userId,
      status: entity.status,
      rsvpDate: entity.rsvpDate,
      checkInDate: entity.checkInDate || undefined,
      cancelledDate: entity.cancelledDate || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
