import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import { IdentityModule } from './modules/identity/identity.module';
import { FinanceModule } from './modules/finance/finance.module';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProviderModule } from './modules/provider/provider.module';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import { createLoggerConfig } from './config/logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    // Conditionally load TypeORM based on USE_TYPEORM env variable
    ...(process.env.USE_TYPEORM !== 'false'
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const config =
                configService.get<ReturnType<typeof databaseConfig>>('database');
              if (!config) {
                throw new Error('Database configuration not found');
              }
              return config;
            },
            inject: [ConfigService],
          }),
        ]
      : []),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: 60000, // 1 minute
          limit: configService.get('NODE_ENV') === 'production' ? 10 : 100, // 10 requests per minute in prod, 100 in dev
        },
      ],
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createLoggerConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    IdentityModule,
    FinanceModule,
    EventModule,
    AuthModule,
    ProviderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
