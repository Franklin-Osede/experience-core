import { ApiProperty } from '@nestjs/swagger';
import { GigApplicationStatus } from '../../domain/gig-application.entity';
import { GigApplication } from '../../domain/gig-application.entity';

export class GigApplicationResponseDto {
  @ApiProperty({ description: 'Application unique identifier' })
  id: string;

  @ApiProperty({ description: 'Venue availability ID' })
  availabilityId: string;

  @ApiProperty({ description: 'DJ ID who applied' })
  djId: string;

  @ApiProperty({ description: 'DJ proposal/application text' })
  proposal: string;

  @ApiProperty({ enum: GigApplicationStatus, description: 'Current status' })
  status: GigApplicationStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  /**
   * Maps a domain GigApplication entity to GigApplicationResponseDto
   */
  static fromDomain(application: GigApplication): GigApplicationResponseDto {
    const props = (application as any).props;
    return {
      id: application.id,
      availabilityId: props.availabilityId,
      djId: props.djId,
      proposal: props.proposal,
      status: props.status,
      createdAt: props.createdAt,
    };
  }
}

