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
import { FundEventUseCase } from '../application/fund-event.use-case';
import { CompleteEventUseCase } from '../application/complete-event.use-case';
import { CancelEventUseCase } from '../application/cancel-event.use-case';
import { ListEventRsvpsUseCase } from '../application/list-event-rsvps.use-case';
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
    private readonly fundEventUseCase: FundEventUseCase,
    private readonly completeEventUseCase: CompleteEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly listEventRsvpsUseCase: ListEventRsvpsUseCase,
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
  @ApiOperation({ summary: 'List events with optional filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated and filtered list of events.',
  })
  async list(@Query() listEventsDto: ListEventsDto) {
    const result = await this.listEventsUseCase.execute(listEventsDto);
    
    return {
      ...result,
      data: result.data.map((event: any) => {
        const props = event.props;
        return {
          id: event.id || event._id,
          organizerId: props.organizerId,
          title: props.title,
          description: props.description,
          type: props.type,
          genre: props.genre,
          status: props.status,
          startTime: props.startTime,
          endTime: props.endTime,
          location: props.location,
          venueId: props.venueId,
          maxCapacity: props.maxCapacity,
          isEscrowFunded: props.isEscrowFunded,
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
        };
      }),
    };
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
  @UseGuards(AuthGuard('jwt'))
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

  @Post(':id/fund')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mark event as funded (Escrow)' })
  @ApiResponse({
    status: 200,
    description: 'Event marked as funded and confirmed.',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be funded' })
  @ApiBearerAuth()
  async fund(@Param('id') id: string) {
    await this.fundEventUseCase.execute(id);
    return { message: 'Event funded and confirmed successfully' };
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mark event as completed' })
  @ApiResponse({
    status: 200,
    description: 'Event marked as completed.',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be completed' })
  @ApiBearerAuth()
  async complete(@Param('id') id: string) {
    await this.completeEventUseCase.execute(id);
    return { message: 'Event completed successfully' };
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cancel an event' })
  @ApiResponse({
    status: 200,
    description: 'Event cancelled successfully.',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be cancelled' })
  @ApiBearerAuth()
  async cancel(@Param('id') id: string) {
    await this.cancelEventUseCase.execute(id);
    return { message: 'Event cancelled successfully' };
  }

  @Get(':id/rsvps')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all RSVPs for an event' })
  @ApiResponse({
    status: 200,
    description: 'List of RSVPs returned.',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async listRsvps(@Param('id') id: string) {
    const attendees = await this.listEventRsvpsUseCase.execute(id);

    return {
      eventId: id,
      total: attendees.length,
      rsvps: attendees.map((attendee) => ({
        id: attendee.id,
        userId: attendee.userId,
        status: attendee.status,
        rsvpDate: (attendee as any).props.rsvpDate,
        checkInDate: attendee.checkInDate,
        cancelledDate: (attendee as any).props.cancelledDate,
        createdAt: (attendee as any).props.createdAt,
        updatedAt: (attendee as any).props.updatedAt,
      })),
    };
  }
}
