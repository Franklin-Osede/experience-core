import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsNotEmpty } from 'class-validator';

class LoginOptionsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiTags('Auth - WebAuthn')
@Controller('auth/webauthn')
export class AuthWebAuthnController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('register/options')
  @ApiOperation({ summary: 'Generate WebAuthn registration options' })
  async registerOptions(@Request() req: any) {
    return this.authService.generateRegistrationOptions(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('register/verify')
  @ApiOperation({ summary: 'Verify WebAuthn registration' })
  async registerVerify(@Request() req: any, @Body() body: any) {
    return this.authService.verifyRegistration(req.user.id, body);
  }

  @Post('login/options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate WebAuthn login options' })
  async loginOptions(@Body() dto: LoginOptionsDto) {
    return this.authService.generateAuthenticationOptions(dto.email);
  }

  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify WebAuthn login' })
  async loginVerify(@Body() body: any) {
    if (!body.email) {
      throw new Error('Email is required for verification');
    }
    return this.authService.verifyAuthentication(body.email, body);
  }
}
