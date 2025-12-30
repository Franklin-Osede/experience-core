import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { CreateUserDto } from '../application/create-user.dto';

@ApiTags('Identity')
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
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
}
