import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostVenueAvailabilityUseCase } from '../application/post-venue-availability.use-case';
import { ListVenueAvailabilitiesUseCase } from '../application/list-venue-availabilities.use-case';
import { ApplyToGigUseCase } from '../application/apply-to-gig.use-case';
import { AcceptGigApplicationUseCase } from '../application/accept-gig-application.use-case';
import { ListGigApplicationsUseCase } from '../application/list-gig-applications.use-case';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { EventType } from '../domain/event-type.enum';
import { EventGenre } from '../domain/event-genre.enum';
import { AvailabilityStatus } from '../domain/venue-availability.entity';
import { GigApplicationStatus } from '../domain/gig-application.entity';

interface AuthenticatedRequest {
  user?: {
    id: string;
  };
}

class PostAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  venueId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  minGuaranteeAmount: number; // in cents

  @IsString()
  @IsNotEmpty()
  minGuaranteeCurrency: string;

  @IsString()
  @IsNotEmpty()
  terms: string;
}

class ApplyToGigDto {
  @IsString()
  @IsNotEmpty()
  availabilityId: string;

  @IsString()
  @IsNotEmpty()
  proposal: string;
}

class AcceptGigDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  eventTitle: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsEnum(EventGenre)
  @IsOptional()
  eventGenre?: EventGenre;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

@ApiTags('Gig Market')
@Controller('gigs')
export class GigController {
  constructor(
    private readonly postAvailabilityUseCase: PostVenueAvailabilityUseCase,
    private readonly listAvailabilitiesUseCase: ListVenueAvailabilitiesUseCase,
    private readonly applyToGigUseCase: ApplyToGigUseCase,
    private readonly acceptGigUseCase: AcceptGigApplicationUseCase,
    private readonly listApplicationsUseCase: ListGigApplicationsUseCase,
  ) {}

  @Post('venues/availability')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Post venue availability (VENUE role only)' })
  @ApiResponse({
    status: 201,
    description: 'Availability posted successfully',
  })
  @ApiBearerAuth()
  async postAvailability(
    @Request() req: AuthenticatedRequest,
    @Body() dto: PostAvailabilityDto,
  ) {
    const availability = await this.postAvailabilityUseCase.execute({
      venueId: dto.venueId,
      date: new Date(dto.date),
      minGuaranteeAmount: dto.minGuaranteeAmount,
      minGuaranteeCurrency: dto.minGuaranteeCurrency,
      terms: dto.terms,
    });

    return {
      id: availability.id,
      venueId: availability.venueId,
      date: (availability as any).props.date,
      minGuarantee: {
        amount: (availability as any).props.minGuarantee.amount,
        currency: (availability as any).props.minGuarantee.currency,
      },
      terms: (availability as any).props.terms,
      status: (availability as any).props.status,
      createdAt: (availability as any).props.createdAt,
    };
  }

  @Get('venues/availability')
  @ApiOperation({ summary: 'List venue availabilities' })
  @ApiResponse({
    status: 200,
    description: 'List of availabilities returned',
  })
  async listAvailabilities(
    @Query('venueId') venueId?: string,
    @Query('status') status?: AvailabilityStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const availabilities = await this.listAvailabilitiesUseCase.execute({
      venueId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });

    return {
      total: availabilities.length,
      availabilities: availabilities.map((a) => ({
        id: a.id,
        venueId: a.venueId,
        date: (a as any).props.date,
        minGuarantee: {
          amount: (a as any).props.minGuarantee.amount,
          currency: (a as any).props.minGuarantee.currency,
        },
        terms: (a as any).props.terms,
        status: (a as any).props.status,
        createdAt: (a as any).props.createdAt,
      })),
    };
  }

  @Post('apply')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Apply to a gig (DJ role only)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
  })
  @ApiBearerAuth()
  async applyToGig(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ApplyToGigDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const application = await this.applyToGigUseCase.execute({
      djId: userId,
      availabilityId: dto.availabilityId,
      proposal: dto.proposal,
    });

    return {
      id: application.id,
      availabilityId: application.availabilityId,
      djId: application.djId,
      proposal: application.proposal,
      status: (application as any).props.status,
      createdAt: (application as any).props.createdAt,
    };
  }

  @Post('applications/:id/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Accept a gig application (VENUE role only)' })
  @ApiResponse({
    status: 201,
    description: 'Application accepted, event created',
  })
  @ApiBearerAuth()
  async acceptApplication(
    @Param('id') applicationId: string,
    @Body() dto: Omit<AcceptGigDto, 'applicationId'>,
  ) {
    const event = await this.acceptGigUseCase.execute({
      applicationId,
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });

    return {
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      type: (event as any).props.type,
      genre: (event as any).props.genre,
      status: (event as any).props.status,
      venueId: event.venueId,
      startTime: (event as any).props.startTime,
      endTime: (event as any).props.endTime,
      message: 'Application accepted and event created',
    };
  }

  @Get('applications')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List gig applications' })
  @ApiResponse({
    status: 200,
    description: 'List of applications returned',
  })
  @ApiBearerAuth()
  async listApplications(
    @Query('availabilityId') availabilityId?: string,
    @Query('djId') djId?: string,
    @Query('status') status?: GigApplicationStatus,
  ) {
    const applications = await this.listApplicationsUseCase.execute({
      availabilityId,
      djId,
      status,
    });

    return {
      total: applications.length,
      applications: applications.map((a) => ({
        id: a.id,
        availabilityId: a.availabilityId,
        djId: a.djId,
        proposal: a.proposal,
        status: (a as any).props.status,
        createdAt: (a as any).props.createdAt,
      })),
    };
  }
}

