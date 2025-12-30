import { Injectable } from '@nestjs/common';
import { Wallet } from '../domain/wallet.entity';
import { WalletRepository } from '../domain/wallet.repository';

@Injectable()
export class InMemoryWalletRepository implements WalletRepository {
  private wallets: Map<string, Wallet> = new Map();

  save(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
    return Promise.resolve();
  }

  findByUserId(userId: string): Promise<Wallet | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.userId === userId) {
        return Promise.resolve(wallet);
      }
    }
    return Promise.resolve(null);
  }
}
