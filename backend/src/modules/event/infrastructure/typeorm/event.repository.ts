import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../domain/event.entity';
import { EventRepository } from '../../domain/event.repository';
import { EventEntity } from './event.entity';
import { EventType } from '../../domain/event-type.enum';
import { EventStatus } from '../../domain/event-status.enum';

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
    const where: any = {};
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const entities = await this.typeOrmRepository.find({ where });
    return entities.map((entity) => this.toDomain(entity));
  }

  private toEntity(event: Event): EventEntity {
    const props = (event as any).props;
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
      isEscrowFunded: entity.isEscrowFunded,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

