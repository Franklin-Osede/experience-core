import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendeeStatus } from '../../domain/attendee-status.enum';
import { EventAttendee } from '../../domain/event-attendee.entity';

export class EventAttendeeResponseDto {
  @ApiProperty({ description: 'RSVP unique identifier' })
  id: string;

  @ApiProperty({ description: 'Event ID' })
  eventId: string;

  @ApiProperty({ description: 'User ID who RSVPed' })
  userId: string;

  @ApiProperty({ enum: AttendeeStatus, description: 'Current status of the RSVP' })
  status: AttendeeStatus;

  @ApiProperty({ description: 'Date when user RSVPed' })
  rsvpDate: Date;

  @ApiPropertyOptional({ description: 'Date when user checked in (if attended)' })
  checkInDate?: Date;

  @ApiPropertyOptional({ description: 'Date when RSVP was cancelled (if cancelled)' })
  cancelledDate?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Maps a domain EventAttendee entity to EventAttendeeResponseDto
   */
  static fromDomain(attendee: EventAttendee): EventAttendeeResponseDto {
    const props = (attendee as any).props;
    return {
      id: attendee.id,
      eventId: props.eventId,
      userId: props.userId,
      status: props.status,
      rsvpDate: props.rsvpDate,
      checkInDate: props.checkInDate,
      cancelledDate: props.cancelledDate,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

