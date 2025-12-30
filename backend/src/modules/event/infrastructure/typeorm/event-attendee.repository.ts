import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventAttendee } from '../../domain/event-attendee.entity';
import { EventAttendeeRepository } from '../../domain/event-attendee.repository';
import { EventAttendeeEntity } from './event-attendee.entity';

/**
 * TypeORM implementation of EventAttendeeRepository
 */
@Injectable()
export class TypeOrmEventAttendeeRepository
  implements EventAttendeeRepository
{
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

  private toEntity(attendee: EventAttendee): EventAttendeeEntity {
    const props = (attendee as any).props;
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

