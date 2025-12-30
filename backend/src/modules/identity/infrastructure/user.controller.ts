import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { CreateUserDto } from '../application/create-user.dto';
import { GetUserProfileUseCase } from '../application/get-user-profile.use-case';
import { InviteUserUseCase } from '../application/invite-user.use-case';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../domain/user-role.enum';

interface AuthenticatedRequest {
  user?: {
    id: string;
  };
}

class InviteUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

@ApiTags('Identity')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly inviteUserUseCase: InviteUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      inviteCredits: user.inviteCredits,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await this.getUserProfileUseCase.execute(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      reputationScore: user.reputationScore,
      inviteCredits: user.inviteCredits,
      eventsAttended: user.eventsAttended,
      hasUnlockedInvites: user.hasUnlockedInvites,
      outstandingDebt: {
        amount: user.outstandingDebt.amount,
        currency: user.outstandingDebt.currency,
        formatted: user.outstandingDebt.toString(),
      },
      profilePhotoUrl: user.profilePhotoUrl,
      isPhotoVerified: user.isPhotoVerified,
      createdAt: (user as any).props.createdAt,
      updatedAt: (user as any).props.updatedAt,
    };
  }

  @Get('me/invites')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user invite credits' })
  @ApiResponse({ status: 200, description: 'Invite credits returned' })
  async getInvites(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await this.getUserProfileUseCase.execute(userId);

    return {
      inviteCredits: user.inviteCredits === Infinity ? -1 : user.inviteCredits,
      hasUnlockedInvites: user.hasUnlockedInvites,
      eventsAttended: user.eventsAttended,
      canInvite: user.inviteCredits > 0 || user.inviteCredits === Infinity,
    };
  }

  @Post('invite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a new user' })
  @ApiResponse({ status: 201, description: 'User invited successfully' })
  @ApiResponse({ status: 400, description: 'No invite credits available' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async invite(
    @Request() req: AuthenticatedRequest,
    @Body() dto: InviteUserDto,
  ) {
    const inviterId = req.user?.id;
    if (!inviterId) {
      throw new Error('User not authenticated');
    }

    const result = await this.inviteUserUseCase.execute({
      inviterId,
      ...dto,
    });

    return {
      invitedUser: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      inviteUsed: result.inviteUsed,
      message: 'User invited successfully',
    };
  }
}
