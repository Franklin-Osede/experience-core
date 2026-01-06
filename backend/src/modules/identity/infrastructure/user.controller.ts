import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/infrastructure/decorators/roles.decorator';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { CreateUserDto } from '../application/create-user.dto';
import { GetUserProfileUseCase } from '../application/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.use-case';
import { UpdateUserProfileDto } from '../application/update-user-profile.dto';
import { InviteUserUseCase } from '../application/invite-user.use-case';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../domain/user-role.enum';
import { UserResponseDto } from './dto/user-response.dto';

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
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly inviteUserUseCase: InviteUserUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN role can create users',
  })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiBearerAuth()
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
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.getUserProfileUseCase.execute(userId);
    return UserResponseDto.fromDomain(user);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.updateUserProfileUseCase.execute(userId, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Get('me/invites')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user invite credits' })
  @ApiResponse({ status: 200, description: 'Invite credits returned' })
  async getInvites(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
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
      throw new UnauthorizedException('User not authenticated');
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
