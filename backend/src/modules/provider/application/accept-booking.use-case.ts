import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ServiceBooking,
  BookingStatus,
} from '../domain/service-booking.entity';
import { ServiceBookingRepository } from '../domain/provider.repository';

@Injectable()
export class AcceptBookingUseCase {
  constructor(
    @Inject('ServiceBookingRepository')
    private readonly bookingRepository: ServiceBookingRepository,
  ) {}

  async execute(
    providerId: string,
    bookingId: string,
  ): Promise<ServiceBooking> {
    // 1. Verify that the booking exists
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // 2. Verify that it belongs to the provider
    if (booking.providerId !== providerId) {
      throw new ForbiddenException(
        'You can only accept bookings for your own services',
      );
    }

    // 3. Verify it's in PENDING status
    const props = (booking as any).props;
    if (props.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only accept pending bookings');
    }

    // 4. Confirm booking
    booking.confirm();

    // 5. Save
    await this.bookingRepository.save(booking);
    return booking;
  }
}
