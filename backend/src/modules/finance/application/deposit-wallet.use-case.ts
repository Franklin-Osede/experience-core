import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from '../domain/wallet.repository';
import { TransactionRepository } from '../domain/transaction.repository';
import { Wallet } from '../domain/wallet.entity';
import { Transaction } from '../domain/transaction.entity';
import { TransactionType } from '../domain/transaction-type.enum';
import { Money } from '../../../shared/domain/money.vo';

interface DepositWalletDto {
  userId: string;
  amount: number; // in cents
  currency: string;
  referenceId?: string; // Stripe Payment ID or similar
}

@Injectable()
export class DepositWalletUseCase {
  constructor(
    @Inject('WalletRepository')
    private readonly walletRepository: WalletRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(dto: DepositWalletDto): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(dto.userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found for user');
    }

    const amount = new Money(dto.amount, dto.currency);

    // 1. Update Wallet Balance
    wallet.deposit(amount);
    await this.walletRepository.save(wallet);

    // 2. Record Transaction Ledger
    // This effectively creates an immutable record of WHY the balance changed.
    const transaction = Transaction.create({
      walletId: wallet.id,
      amount: amount,
      type: TransactionType.DEPOSIT,
      referenceId: dto.referenceId || `MANUAL_DEPOSIT_${Date.now()}`,
    });

    await this.transactionRepository.save(transaction);

    return wallet;
  }
}
