import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ServiceListing } from '../../domain/service-listing.entity';
import { ServiceListingRepository } from '../../domain/provider.repository';
import { ServiceListingEntity } from './service-listing.entity';
import { ServiceCategory } from '../../domain/service-category.enum';
import { Money } from '../../../../shared/domain/money.vo';

/**
 * TypeORM implementation of ServiceListingRepository
 */
@Injectable()
export class TypeOrmServiceListingRepository implements ServiceListingRepository {
  constructor(
    @InjectRepository(ServiceListingEntity)
    private readonly typeOrmRepository: Repository<ServiceListingEntity>,
  ) {}

  async save(listing: ServiceListing): Promise<void> {
    const entity = this.toEntity(listing);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<ServiceListing | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async search(category?: string): Promise<ServiceListing[]> {
    const where: FindOptionsWhere<ServiceListingEntity> = { isAvailable: true };
    if (category) {
      where.category = category as ServiceCategory;
    }

    const entities = await this.typeOrmRepository.find({ where });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByProviderId(providerId: string): Promise<ServiceListing[]> {
    const entities = await this.typeOrmRepository.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  private toEntity(listing: ServiceListing): ServiceListingEntity {
    const props = (listing as any).props;
    const entity = new ServiceListingEntity();
    entity.id = listing.id;
    entity.providerId = props.providerId;
    entity.title = props.title;
    entity.description = props.description;
    entity.category = props.category;
    entity.pricePerDayAmount = props.pricePerDay.amount;
    entity.pricePerDayCurrency = props.pricePerDay.currency;
    entity.specs = props.specs || null;
    entity.isAvailable = props.isAvailable;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: ServiceListingEntity): ServiceListing {
    return ServiceListing.fromPersistence({
      id: entity.id,
      providerId: entity.providerId,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      pricePerDay: new Money(
        entity.pricePerDayAmount,
        entity.pricePerDayCurrency,
      ),
      specs: entity.specs || undefined,
      isAvailable: entity.isAvailable,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

