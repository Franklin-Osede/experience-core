import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from '../domain/wallet.repository';
import { Wallet } from '../domain/wallet.entity';
import { Money } from '../../../shared/domain/money.vo';

interface DepositWalletDto {
  userId: string;
  amount: number; // in cents
  currency: string;
}

@Injectable()
export class DepositWalletUseCase {
  constructor(
    @Inject('WalletRepository')
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(dto: DepositWalletDto): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(dto.userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found for user');
    }

    const amount = new Money(dto.amount, dto.currency);
    wallet.deposit(amount);

    await this.walletRepository.save(wallet);

    return wallet;
  }
}

