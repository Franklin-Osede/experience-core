import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventGenre } from '../../event/domain/event-genre.enum';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'User phone number for verification',
    example: '+15551234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User preferred music genres',
    enum: EventGenre,
    isArray: true,
    example: [EventGenre.AFRO_HOUSE, EventGenre.HOUSE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventGenre, { each: true })
  preferredGenres?: EventGenre[];
}
