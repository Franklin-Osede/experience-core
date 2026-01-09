import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../identity/domain/user-role.enum';
import { CreateServiceListingUseCase } from '../application/create-service-listing.use-case';
import { ListServiceListingsUseCase } from '../application/list-service-listings.use-case';
import { GetServiceListingUseCase } from '../application/get-service-listing.use-case';
import { BookServiceUseCase } from '../application/book-service.use-case';
import { AcceptBookingUseCase } from '../application/accept-booking.use-case';
import { RejectBookingUseCase } from '../application/reject-booking.use-case';
import { UpdateServiceListingUseCase } from '../application/update-service-listing.use-case';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { ServiceCategory } from '../domain/service-category.enum';
import { ServiceListingResponseDto } from './dto/service-listing-response.dto';
import { ServiceBookingResponseDto } from './dto/service-booking-response.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
    role: string;
  };
}

class CreateServiceListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsNumber()
  @Min(1)
  pricePerDayAmount: number;

  @IsString()
  @IsNotEmpty()
  pricePerDayCurrency: string;

  @IsOptional()
  specs?: Record<string, any>;
}

class UpdateServiceListingDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  pricePerDayAmount?: number;

  @IsOptional()
  @IsString()
  pricePerDayCurrency?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

class BookServiceDto {
  @IsString()
  @IsNotEmpty()
  serviceListingId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

@ApiTags('Provider Marketplace')
@Controller('providers')
export class ProviderController {
  constructor(
    private readonly createListingUseCase: CreateServiceListingUseCase,
    private readonly listListingsUseCase: ListServiceListingsUseCase,
    private readonly getListingUseCase: GetServiceListingUseCase,
    private readonly bookServiceUseCase: BookServiceUseCase,
    private readonly acceptBookingUseCase: AcceptBookingUseCase,
    private readonly rejectBookingUseCase: RejectBookingUseCase,
    private readonly updateListingUseCase: UpdateServiceListingUseCase,
  ) {}

  @Post('listings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a service listing (PROVIDER only)' })
  @ApiResponse({
    status: 201,
    description: 'Service listing created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only PROVIDER role can create listings',
  })
  @ApiBearerAuth()
  async createListing(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateServiceListingDto,
  ) {
    const providerId = req.user?.id;
    if (!providerId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const listing = await this.createListingUseCase.execute(providerId, dto);
    return ServiceListingResponseDto.fromDomain(listing);
  }

  @Get('listings')
  @ApiOperation({ summary: 'List service listings with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of service listings returned',
  })
  async listListings(
    @Query('category') category?: ServiceCategory,
    @Query('providerId') providerId?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    const listings = await this.listListingsUseCase.execute({
      category,
      providerId,
      isAvailable:
        isAvailable === 'true'
          ? true
          : isAvailable === 'false'
            ? false
            : undefined,
    });

    return {
      total: listings.length,
      listings: listings.map((listing) =>
        ServiceListingResponseDto.fromDomain(listing),
      ),
    };
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get service listing by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service listing returned',
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getListing(@Param('id') id: string) {
    const listing = await this.getListingUseCase.execute(id);
    return ServiceListingResponseDto.fromDomain(listing);
  }

  @Patch('listings/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Update service listing (PROVIDER owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Service listing updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only listing owner can update',
  })
  @ApiBearerAuth()
  async updateListing(
    @Param('id') listingId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateServiceListingDto,
  ) {
    const providerId = req.user?.id;
    if (!providerId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const listing = await this.updateListingUseCase.execute(
      providerId,
      listingId,
      dto,
    );
    return ServiceListingResponseDto.fromDomain(listing);
  }

  @Post('bookings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE, UserRole.FOUNDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Book a service for an event (Organizers only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Service booked successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only event organizers can book services',
  })
  @ApiBearerAuth()
  async bookService(
    @Request() req: AuthenticatedRequest,
    @Body() dto: BookServiceDto,
  ) {
    const organizerId = req.user?.id;
    if (!organizerId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const booking = await this.bookServiceUseCase.execute(organizerId, dto);
    return ServiceBookingResponseDto.fromDomain(booking);
  }

  @Post('bookings/:id/accept')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Accept a booking (PROVIDER only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking accepted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only PROVIDER can accept bookings',
  })
  @ApiBearerAuth()
  async acceptBooking(
    @Param('id') bookingId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const providerId = req.user?.id;
    if (!providerId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const booking = await this.acceptBookingUseCase.execute(
      providerId,
      bookingId,
    );
    return ServiceBookingResponseDto.fromDomain(booking);
  }

  @Post('bookings/:id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Reject a booking (PROVIDER only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking rejected successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only PROVIDER can reject bookings',
  })
  @ApiBearerAuth()
  async rejectBooking(
    @Param('id') bookingId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const providerId = req.user?.id;
    if (!providerId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const booking = await this.rejectBookingUseCase.execute(
      providerId,
      bookingId,
    );
    return ServiceBookingResponseDto.fromDomain(booking);
  }

  @Get('bookings')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List bookings (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'List of bookings returned',
  })
  @ApiBearerAuth()
  async listBookings(
    @Request() req: AuthenticatedRequest,
    @Query('eventId') eventId?: string,
  ) {
    // This would need a ListBookingsUseCase
    // For now, return empty array
    return {
      total: 0,
      bookings: [],
    };
  }
}
