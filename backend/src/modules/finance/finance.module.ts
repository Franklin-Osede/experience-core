import { Module } from '@nestjs/common';
import { CreateWalletHandler } from './application/create-wallet.handler';
import { InMemoryWalletRepository } from './infrastructure/in-memory-wallet.repository';

@Module({
  providers: [
    CreateWalletHandler,
    {
      provide: 'WalletRepository',
      useClass: InMemoryWalletRepository,
    },
  ],
  exports: ['WalletRepository'],
})
export class FinanceModule {}
