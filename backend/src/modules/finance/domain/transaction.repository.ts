import { Transaction } from './transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findByWalletId(walletId: string): Promise<Transaction[]>;
}
