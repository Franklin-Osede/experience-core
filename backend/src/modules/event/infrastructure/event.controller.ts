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
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../modules/identity/domain/user-role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateEventUseCase } from '../application/create-event.use-case';
import { ListEventsUseCase } from '../application/list-events.use-case';
import { GetEventUseCase } from '../application/get-event.use-case';
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
import { EventResponseDto } from './dto/event-response.dto';
import { EventAttendeeResponseDto } from './dto/event-attendee-response.dto';
import { PaginatedResponseDto } from '../../../shared/infrastructure/dto/paginated-response.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
    role: string;
  };
}

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventUseCase: GetEventUseCase,
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE)
  @ApiOperation({ summary: 'Create a new draft event (DJ or VENUE only)' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only DJ or VENUE roles can create events',
  })
  @ApiBearerAuth()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.createEventUseCase.execute(userId, createEventDto);
    return EventResponseDto.fromDomain(event);
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
      data: result.data.map((event) => EventResponseDto.fromDomain(event)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event details returned.',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
  })
  async getById(@Param('id') id: string) {
    const event = await this.getEventUseCase.execute(id);
    return EventResponseDto.fromDomain(event);
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE)
  @ApiOperation({
    summary: 'Publish a draft event (DRAFT → PUBLISHED) - DJ or VENUE only',
  })
  @ApiResponse({
    status: 200,
    description: 'Event successfully published.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only event organizer or ADMIN can publish events',
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
  async publish(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;
    if (!userId || !userRole) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.publishEventUseCase.execute(id, userId, userRole);
    return EventResponseDto.fromDomain(event);
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
      throw new UnauthorizedException('User not authenticated');
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
      throw new UnauthorizedException('User not authenticated');
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mark event as funded (Escrow) - DJ, VENUE or ADMIN only',
  })
  @ApiResponse({
    status: 200,
    description: 'Event marked as funded and confirmed.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only event organizer or ADMIN can fund events',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be funded' })
  @ApiBearerAuth()
  async fund(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;
    if (!userId || !userRole) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.fundEventUseCase.execute(id, userId, userRole);
    return { message: 'Event funded and confirmed successfully' };
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Mark event as completed - DJ, VENUE or ADMIN only',
  })
  @ApiResponse({
    status: 200,
    description: 'Event marked as completed.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only event organizer or ADMIN can complete events',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be completed' })
  @ApiBearerAuth()
  async complete(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;
    if (!userId || !userRole) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.completeEventUseCase.execute(id, userId, userRole);
    return { message: 'Event completed successfully' };
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel an event - DJ, VENUE or ADMIN only' })
  @ApiResponse({
    status: 200,
    description: 'Event cancelled successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only event organizer or ADMIN can cancel events',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Event cannot be cancelled' })
  @ApiBearerAuth()
  async cancel(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    const userRole = req.user?.role as UserRole;
    if (!userId || !userRole) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.cancelEventUseCase.execute(id, userId, userRole);
    return { message: 'Event cancelled successfully' };
  }

  @Get(':id/rsvps')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.DJ, UserRole.VENUE, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all RSVPs for an event - DJ, VENUE or ADMIN only',
  })
  @ApiResponse({
    status: 200,
    description: 'List of RSVPs returned.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only DJ, VENUE or ADMIN roles can view RSVPs',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async listRsvps(@Param('id') id: string) {
    const attendees = await this.listEventRsvpsUseCase.execute(id);

    return {
      eventId: id,
      total: attendees.length,
      rsvps: attendees.map((attendee) =>
        EventAttendeeResponseDto.fromDomain(attendee),
      ),
    };
  }
}
