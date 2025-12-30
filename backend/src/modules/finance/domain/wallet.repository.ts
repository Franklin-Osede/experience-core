import { Wallet } from './wallet.entity';

export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  findByUserId(userId: string): Promise<Wallet | null>;
}
