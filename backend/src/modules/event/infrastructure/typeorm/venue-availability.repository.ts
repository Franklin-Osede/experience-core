import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueAvailability } from '../../domain/venue-availability.entity';
import { VenueAvailabilityRepository } from '../../domain/venue-availability.repository';
import { VenueAvailabilityEntity } from './venue-availability.entity';
import { Money } from '../../../../shared/domain/money.vo';
import { AvailabilityStatus } from '../../domain/venue-availability.entity';

@Injectable()
export class TypeOrmVenueAvailabilityRepository implements VenueAvailabilityRepository {
  constructor(
    @InjectRepository(VenueAvailabilityEntity)
    private readonly typeOrmRepository: Repository<VenueAvailabilityEntity>,
  ) {}

  async save(availability: VenueAvailability): Promise<void> {
    const entity = this.toEntity(availability);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<VenueAvailability | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByVenueId(venueId: string): Promise<VenueAvailability[]> {
    const entities = await this.typeOrmRepository.find({
      where: { venueId },
      order: { date: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAllOpen(date?: Date): Promise<VenueAvailability[]> {
    const queryBuilder = this.typeOrmRepository
      .createQueryBuilder('availability')
      .where('availability.status = :status', {
        status: AvailabilityStatus.OPEN,
      });

    if (date) {
      queryBuilder.andWhere('availability.date >= :date', { date });
    }

    queryBuilder.orderBy('availability.date', 'ASC');

    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<VenueAvailability[]> {
    const entities = await this.typeOrmRepository.find({
      order: { date: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  private toEntity(availability: VenueAvailability): VenueAvailabilityEntity {
    const props = availability.getProps();
    const entity = new VenueAvailabilityEntity();
    entity.id = availability.id;
    entity.venueId = props.venueId;
    entity.date = props.date;
    entity.minGuaranteeAmount = props.minGuarantee.amount;
    entity.minGuaranteeCurrency = props.minGuarantee.currency;
    entity.terms = props.terms;
    entity.status = props.status;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: VenueAvailabilityEntity): VenueAvailability {
    return VenueAvailability.fromPersistence({
      id: entity.id,
      venueId: entity.venueId,
      date: entity.date,
      minGuarantee: new Money(
        entity.minGuaranteeAmount,
        entity.minGuaranteeCurrency,
      ),
      terms: entity.terms,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

