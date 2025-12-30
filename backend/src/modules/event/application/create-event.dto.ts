import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { EventType } from '../domain/event-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Sunset Vibes on Rooftop',
    description: 'Title of the event',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A chill session with house music and cocktails.',
    description: 'Description of the event',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: EventType, example: EventType.HOUSE_DAY })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '2025-06-20T18:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2025-06-20T23:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    example: 'Marina Beach Club',
    description: 'Human readable location',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    description: 'ID of the specific venue if known',
  })
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  maxCapacity?: number;
}
