import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from '../domain/wallet.repository';
import { Wallet } from '../domain/wallet.entity';

@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject('WalletRepository')
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found for user');
    }

    return wallet;
  }
}

