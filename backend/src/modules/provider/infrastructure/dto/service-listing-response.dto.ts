import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../../domain/service-category.enum';
import { ServiceListing } from '../../domain/service-listing.entity';

export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  currency: string;
}

export class ServiceListingResponseDto {
  @ApiProperty({ description: 'Listing unique identifier' })
  id: string;

  @ApiProperty({ description: 'Provider ID who owns this listing' })
  providerId: string;

  @ApiProperty({ description: 'Service title' })
  title: string;

  @ApiProperty({ description: 'Service description' })
  description: string;

  @ApiProperty({ enum: ServiceCategory, description: 'Service category' })
  category: ServiceCategory;

  @ApiProperty({ description: 'Price per day' })
  pricePerDay: MoneyResponseDto;

  @ApiPropertyOptional({ description: 'Technical specifications' })
  specs?: Record<string, any>;

  @ApiProperty({ description: 'Whether the service is currently available' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Maps a domain ServiceListing entity to ServiceListingResponseDto
   */
  static fromDomain(listing: ServiceListing): ServiceListingResponseDto {
    const props = (listing as any).props;
    return {
      id: listing.id,
      providerId: props.providerId,
      title: props.title,
      description: props.description,
      category: props.category,
      pricePerDay: {
        amount: props.pricePerDay.amount,
        currency: props.pricePerDay.currency,
      },
      specs: props.specs,
      isAvailable: props.isAvailable,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

