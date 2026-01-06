import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../domain/user-role.enum';
import { EventGenre } from '../../../event/domain/event-genre.enum';
import { User } from '../../domain/user.entity';

export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  currency: string;

  @ApiProperty({ description: 'Formatted string representation' })
  formatted: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Reputation score' })
  reputationScore: number;

  @ApiProperty({ description: 'Number of invite credits available (-1 means unlimited)' })
  inviteCredits: number;

  @ApiProperty({ description: 'Number of events attended' })
  eventsAttended: number;

  @ApiProperty({ description: 'Whether invites have been unlocked' })
  hasUnlockedInvites: boolean;

  @ApiProperty({ description: 'Outstanding debt information' })
  outstandingDebt: MoneyResponseDto;

  @ApiPropertyOptional({ description: 'Profile photo URL' })
  profilePhotoUrl?: string;

  @ApiProperty({ description: 'Whether profile photo is verified' })
  isPhotoVerified: boolean;

  @ApiPropertyOptional({ description: 'User phone number' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User preferred music genres',
    enum: EventGenre,
    isArray: true,
  })
  preferredGenres?: EventGenre[];

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Maps a domain User entity to UserResponseDto
   */
  static fromDomain(user: User): UserResponseDto {
    const props = (user as any).props;
    return {
      id: user.id,
      email: props.email,
      role: props.role,
      isVerified: props.isVerified,
      reputationScore: props.reputationScore,
      inviteCredits: props.inviteCredits === Infinity ? -1 : props.inviteCredits,
      eventsAttended: props.eventsAttended,
      hasUnlockedInvites: props.hasUnlockedInvites,
      outstandingDebt: {
        amount: props.outstandingDebt.amount,
        currency: props.outstandingDebt.currency,
        formatted: props.outstandingDebt.toString(),
      },
      profilePhotoUrl: props.profilePhotoUrl,
      isPhotoVerified: props.isPhotoVerified,
      phoneNumber: props.phoneNumber,
      preferredGenres: props.preferredGenres,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

