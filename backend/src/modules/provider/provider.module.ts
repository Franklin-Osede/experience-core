import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderController } from './infrastructure/provider.controller';
import { CreateServiceListingUseCase } from './application/create-service-listing.use-case';
import { ListServiceListingsUseCase } from './application/list-service-listings.use-case';
import { GetServiceListingUseCase } from './application/get-service-listing.use-case';
import { BookServiceUseCase } from './application/book-service.use-case';
import { AcceptBookingUseCase } from './application/accept-booking.use-case';
import { RejectBookingUseCase } from './application/reject-booking.use-case';
import { UpdateServiceListingUseCase } from './application/update-service-listing.use-case';
import {
  SERVICE_LISTING_REPOSITORY,
  SERVICE_BOOKING_REPOSITORY,
} from './domain/provider.repository';
import { ServiceListingEntity } from './infrastructure/typeorm/service-listing.entity';
import { ServiceBookingEntity } from './infrastructure/typeorm/service-booking.entity';
import { TypeOrmServiceListingRepository } from './infrastructure/typeorm/service-listing.repository';
import { TypeOrmServiceBookingRepository } from './infrastructure/typeorm/service-booking.repository';
import { InMemoryServiceListingRepository } from './infrastructure/in-memory-service-listing.repository';
import { InMemoryServiceBookingRepository } from './infrastructure/in-memory-service-booking.repository';
import { IdentityModule } from '../identity/identity.module';
import { EventModule } from '../event/event.module';

// Use TypeORM repository in production, in-memory for testing
const useTypeORM = process.env.USE_TYPEORM !== 'false';
const typeOrmImports = useTypeORM
  ? [TypeOrmModule.forFeature([ServiceListingEntity, ServiceBookingEntity])]
  : [];

@Module({
  imports: [
    IdentityModule, // For UserRepository
    EventModule, // For EventRepository
    ...typeOrmImports,
  ],
  controllers: [ProviderController],
  providers: [
    CreateServiceListingUseCase,
    ListServiceListingsUseCase,
    GetServiceListingUseCase,
    BookServiceUseCase,
    AcceptBookingUseCase,
    RejectBookingUseCase,
    UpdateServiceListingUseCase,
    {
      provide: SERVICE_LISTING_REPOSITORY,
      useClass: useTypeORM
        ? TypeOrmServiceListingRepository
        : InMemoryServiceListingRepository,
    },
    {
      provide: SERVICE_BOOKING_REPOSITORY,
      useClass: useTypeORM
        ? TypeOrmServiceBookingRepository
        : InMemoryServiceBookingRepository,
    },
    // Also provide with string token for backward compatibility
    {
      provide: 'ServiceListingRepository',
      useClass: useTypeORM
        ? TypeOrmServiceListingRepository
        : InMemoryServiceListingRepository,
    },
    {
      provide: 'ServiceBookingRepository',
      useClass: useTypeORM
        ? TypeOrmServiceBookingRepository
        : InMemoryServiceBookingRepository,
    },
  ],
  exports: [],
})
export class ProviderModule {}
