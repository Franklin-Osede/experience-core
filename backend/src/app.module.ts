import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { IdentityModule } from './modules/identity/identity.module';
import { FinanceModule } from './modules/finance/finance.module';

import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    IdentityModule,
    FinanceModule,
    EventModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
