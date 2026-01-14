import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthWebAuthnController } from './auth.webauthn.controller';

import { IdentityModule } from '../identity/identity.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { CreateUserUseCase } from '../identity/application/create-user.use-case';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    IdentityModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';

        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }

        const signOptions: jwt.SignOptions = {
          expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
        };

        return {
          secret,
          signOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CreateUserUseCase],
  controllers: [AuthController, AuthWebAuthnController],

  exports: [AuthService],
})
export class AuthModule {}
