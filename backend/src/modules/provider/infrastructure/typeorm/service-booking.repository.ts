import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceBooking } from '../../domain/service-booking.entity';
import { ServiceBookingRepository } from '../../domain/provider.repository';
import { ServiceBookingEntity } from './service-booking.entity';
import { BookingStatus } from '../../domain/service-booking.entity';
import { Money } from '../../../../shared/domain/money.vo';

/**
 * TypeORM implementation of ServiceBookingRepository
 */
@Injectable()
export class TypeOrmServiceBookingRepository implements ServiceBookingRepository {
  constructor(
    @InjectRepository(ServiceBookingEntity)
    private readonly typeOrmRepository: Repository<ServiceBookingEntity>,
  ) {}

  async save(booking: ServiceBooking): Promise<void> {
    const entity = this.toEntity(booking);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<ServiceBooking | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findOverlapping(
    serviceListingId: string,
    start: Date,
    end: Date,
  ): Promise<ServiceBooking[]> {
    // Find bookings that overlap with the given date range
    // Overlap occurs when: booking.startDate <= end AND booking.endDate >= start
    const entities = await this.typeOrmRepository
      .createQueryBuilder('booking')
      .where('booking.serviceListingId = :listingId', {
        listingId: serviceListingId,
      })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .andWhere(
        '(booking.startDate <= :end AND booking.endDate >= :start)',
        { start, end },
      )
      .getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByEventId(eventId: string): Promise<ServiceBooking[]> {
    const entities = await this.typeOrmRepository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  private toEntity(booking: ServiceBooking): ServiceBookingEntity {
    const props = (booking as any).props;
    const entity = new ServiceBookingEntity();
    entity.id = booking.id;
    entity.serviceListingId = props.serviceListingId;
    entity.providerId = props.providerId;
    entity.eventId = props.eventId;
    entity.startDate = props.startDate;
    entity.endDate = props.endDate;
    entity.totalCostAmount = props.totalCost.amount;
    entity.totalCostCurrency = props.totalCost.currency;
    entity.status = props.status;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: ServiceBookingEntity): ServiceBooking {
    return ServiceBooking.fromPersistence({
      id: entity.id,
      serviceListingId: entity.serviceListingId,
      providerId: entity.providerId,
      eventId: entity.eventId,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalCost: new Money(
        entity.totalCostAmount,
        entity.totalCostCurrency,
      ),
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

