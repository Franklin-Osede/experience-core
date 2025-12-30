import { Wallet } from '../domain/wallet.entity';
import { WalletRepository } from '../domain/wallet.repository';
export declare class InMemoryWalletRepository implements WalletRepository {
    private wallets;
    save(wallet: Wallet): Promise<void>;
    findByUserId(userId: string): Promise<Wallet | null>;
}
