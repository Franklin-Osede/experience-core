import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../domain/event-type.enum';
import { EventStatus } from '../../domain/event-status.enum';
import { EventGenre } from '../../domain/event-genre.enum';
import { Event } from '../../domain/event.entity';

export class EventResponseDto {
  @ApiProperty({ description: 'Event unique identifier' })
  id: string;

  @ApiProperty({ description: 'ID of the user who created the event' })
  organizerId: string;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event description' })
  description: string;

  @ApiProperty({ enum: EventType, description: 'Type of event' })
  type: EventType;

  @ApiProperty({ enum: EventGenre, description: 'Music genre' })
  genre: EventGenre;

  @ApiProperty({ enum: EventStatus, description: 'Current status of the event' })
  status: EventStatus;

  @ApiProperty({ description: 'Event start date and time (ISO string)' })
  startTime: Date;

  @ApiProperty({ description: 'Event end date and time (ISO string)' })
  endTime: Date;

  @ApiProperty({ description: 'Event location/address' })
  location: string;

  @ApiPropertyOptional({ description: 'ID of the venue (if assigned)' })
  venueId?: string;

  @ApiPropertyOptional({ description: 'Maximum capacity of the event' })
  maxCapacity?: number;

  @ApiProperty({ description: 'Whether the event is funded via Escrow' })
  isEscrowFunded: boolean;

  @ApiProperty({ description: 'Event creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Event last update date' })
  updatedAt: Date;

  /**
   * Maps a domain Event entity to EventResponseDto
   */
  static fromDomain(event: Event): EventResponseDto {
    const props = (event as any).props;
    return {
      id: event.id,
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
  }
}

