import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../domain/service-booking.entity';
import { ServiceBooking } from '../../domain/service-booking.entity';

export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  currency: string;
}

export class ServiceBookingResponseDto {
  @ApiProperty({ description: 'Booking unique identifier' })
  id: string;

  @ApiProperty({ description: 'Service listing ID' })
  serviceListingId: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'Booking start date' })
  startDate: Date;

  @ApiProperty({ description: 'Booking end date' })
  endDate: Date;

  @ApiProperty({ description: 'Total cost (locked at booking time)' })
  totalCost: MoneyResponseDto;

  @ApiProperty({ enum: BookingStatus, description: 'Current booking status' })
  status: BookingStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Maps a domain ServiceBooking entity to ServiceBookingResponseDto
   */
  static fromDomain(booking: ServiceBooking): ServiceBookingResponseDto {
    const props = (booking as any).props;
    return {
      id: booking.id,
      serviceListingId: props.serviceListingId,
      providerId: props.providerId,
      eventId: props.eventId,
      startDate: props.startDate,
      endDate: props.endDate,
      totalCost: {
        amount: props.totalCost.amount,
        currency: props.totalCost.currency,
      },
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
