import { IsEnum, IsOptional } from 'class-validator';
import { EventType } from '../domain/event-type.enum';
import { EventStatus } from '../domain/event-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListEventsDto {
  @ApiPropertyOptional({ enum: EventType, description: 'Filter by event type' })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({
    enum: EventStatus,
    description: 'Filter by event status',
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
