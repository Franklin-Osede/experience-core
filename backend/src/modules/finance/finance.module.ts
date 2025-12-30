import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateWalletHandler } from './application/create-wallet.handler';
import { GetWalletUseCase } from './application/get-wallet.use-case';
import { DepositWalletUseCase } from './application/deposit-wallet.use-case';
import { CreateSplitPaymentUseCase } from './application/create-split-payment.use-case';
import { PaySplitShareUseCase } from './application/pay-split-share.use-case';
import { SPLIT_PAYMENT_REPOSITORY } from './domain/split-payment.repository';
import { WalletEntity } from './infrastructure/typeorm/wallet.entity';
import { SplitPaymentEntity } from './infrastructure/typeorm/split-payment.entity';
import { SplitPaymentPayerEntity } from './infrastructure/typeorm/split-payment-payer.entity';
import { TypeOrmWalletRepository } from './infrastructure/typeorm/wallet.repository';
import { TypeOrmSplitPaymentRepository } from './infrastructure/typeorm/split-payment.repository';
import { InMemoryWalletRepository } from './infrastructure/in-memory-wallet.repository';
import { InMemorySplitPaymentRepository } from './infrastructure/in-memory-split-payment.repository';
import { FinanceController } from './infrastructure/finance.controller';

// Use TypeORM repository in production, in-memory for testing
const useTypeORM = process.env.USE_TYPEORM !== 'false';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      SplitPaymentEntity,
      SplitPaymentPayerEntity,
    ]),
  ],
  controllers: [FinanceController],
  providers: [
    CreateWalletHandler,
    GetWalletUseCase,
    DepositWalletUseCase,
    {
      provide: 'WalletRepository',
      useClass: useTypeORM ? TypeOrmWalletRepository : InMemoryWalletRepository,
    },
    CreateSplitPaymentUseCase,
    PaySplitShareUseCase,
    {
      provide: SPLIT_PAYMENT_REPOSITORY,
      useClass: useTypeORM
        ? TypeOrmSplitPaymentRepository
        : InMemorySplitPaymentRepository,
    },
  ],
  exports: ['WalletRepository'],
})
export class FinanceModule {}
