import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { EventType } from '../domain/event-type.enum';
import { EventStatus } from '../domain/event-status.enum';
import { EventGenre } from '../domain/event-genre.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class ListEventsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

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

  @ApiPropertyOptional({
    enum: EventGenre,
    description: 'Filter by event genre',
  })
  @IsOptional()
  @IsEnum(EventGenre)
  genre?: EventGenre;

  @ApiPropertyOptional({ description: 'Filter events from this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter events until this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
