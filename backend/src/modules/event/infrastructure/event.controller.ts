import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateEventUseCase } from '../application/create-event.use-case';
import { ListEventsUseCase } from '../application/list-events.use-case';
import { PublishEventUseCase } from '../application/publish-event.use-case';
import { RsvpEventUseCase } from '../application/rsvp-event.use-case';
import { CancelRsvpUseCase } from '../application/cancel-rsvp.use-case';
import { CheckInEventUseCase } from '../application/check-in-event.use-case';
import { CreateEventDto } from '../application/create-event.dto';
import { ListEventsDto } from '../application/list-events.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
  };
}

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly rsvpEventUseCase: RsvpEventUseCase,
    private readonly cancelRsvpUseCase: CancelRsvpUseCase,
    private readonly checkInEventUseCase: CheckInEventUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new draft event' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
  })
  @ApiBearerAuth()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.createEventUseCase.execute(userId, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'List events with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered list of events.',
  })
  async list(@Query() listEventsDto: ListEventsDto) {
    return this.listEventsUseCase.execute(listEventsDto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a draft event (DRAFT → PUBLISHED)' })
  @ApiResponse({
    status: 200,
    description: 'Event successfully published.',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot publish (e.g., missing venue).',
  })
  @ApiBearerAuth()
  async publish(@Param('id') id: string) {
    return this.publishEventUseCase.execute(id);
  }

  @Post(':id/rsvp')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'RSVP to an event' })
  @ApiResponse({
    status: 201,
    description: 'RSVP confirmed.',
  })
  @ApiBearerAuth()
  async rsvp(
    @Param('id') eventId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.rsvpEventUseCase.execute(eventId, userId);
  }

  @Delete(':id/rsvp')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cancel RSVP' })
  @ApiResponse({
    status: 200,
    description: 'RSVP cancelled.',
  })
  @ApiBearerAuth()
  async cancelRsvp(
    @Param('id') eventId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.cancelRsvpUseCase.execute(eventId, userId);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check-in user to event (QR Scan)' })
  @ApiResponse({
    status: 200,
    description: 'User checked in successfully.',
  })
  @ApiBearerAuth()
  async checkIn(
    @Param('id') eventId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // In reality, this endpoint might be called by the Venue Admin scanning a QR code for a specific user.
    // For MVP/Demo: The user "checks themselves in" or we simulate the scanner.
    const userId = req.user?.id || 'mock-attendee-id';
    return this.checkInEventUseCase.execute(eventId, userId);
  }
}
