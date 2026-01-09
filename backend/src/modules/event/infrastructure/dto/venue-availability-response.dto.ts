import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus } from '../../domain/venue-availability.entity';
import { VenueAvailability } from '../../domain/venue-availability.entity';

export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  currency: string;
}

export class VenueAvailabilityResponseDto {
  @ApiProperty({ description: 'Availability unique identifier' })
  id: string;

  @ApiProperty({ description: 'Venue ID' })
  venueId: string;

  @ApiProperty({ description: 'Available date' })
  date: Date;

  @ApiProperty({ description: 'Minimum guarantee required' })
  minGuarantee: MoneyResponseDto;

  @ApiProperty({ description: 'Terms and conditions' })
  terms: string;

  @ApiProperty({ enum: AvailabilityStatus, description: 'Current status' })
  status: AvailabilityStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  /**
   * Maps a domain VenueAvailability entity to VenueAvailabilityResponseDto
   */
  static fromDomain(
    availability: VenueAvailability,
  ): VenueAvailabilityResponseDto {
    const props = (availability as any).props;
    return {
      id: availability.id,
      venueId: props.venueId,
      date: props.date,
      minGuarantee: {
        amount: props.minGuarantee.amount,
        currency: props.minGuarantee.currency,
      },
      terms: props.terms,
      status: props.status,
      createdAt: props.createdAt,
    };
  }
}
