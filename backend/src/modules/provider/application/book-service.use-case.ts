import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ServiceBooking } from '../domain/service-booking.entity';
import { ServiceListingRepository } from '../domain/provider.repository';
import { ServiceBookingRepository } from '../domain/provider.repository';
import { EventRepository } from '../../event/domain/event.repository';

export interface BookServiceDto {
  serviceListingId: string;
  eventId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

@Injectable()
export class BookServiceUseCase {
  constructor(
    @Inject('ServiceListingRepository')
    private readonly listingRepository: ServiceListingRepository,
    @Inject('ServiceBookingRepository')
    private readonly bookingRepository: ServiceBookingRepository,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(
    organizerId: string,
    dto: BookServiceDto,
  ): Promise<ServiceBooking> {
    // 1. Verify that the event exists and belongs to the organizer
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
    }

    const eventProps = (event as any).props;
    if (eventProps.organizerId !== organizerId) {
      throw new ForbiddenException(
        'You can only book services for your own events',
      );
    }

    // 2. Get the listing
    const listing = await this.listingRepository.findById(dto.serviceListingId);
    if (!listing) {
      throw new NotFoundException(
        `Service listing with ID ${dto.serviceListingId} not found`,
      );
    }

    if (!listing.isAvailable) {
      throw new BadRequestException('Service listing is not available');
    }

    // 3. Verify availability (no overlaps)
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const overlapping = await this.bookingRepository.findOverlapping(
      dto.serviceListingId,
      startDate,
      endDate,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Service is already booked for the selected dates',
      );
    }

    // 4. Calculate total cost and create booking
    const booking = ServiceBooking.create(
      dto.serviceListingId,
      listing.providerId,
      dto.eventId,
      startDate,
      endDate,
      listing.pricePerDay,
    );

    // 5. Save
    await this.bookingRepository.save(booking);
    return booking;
  }
}
