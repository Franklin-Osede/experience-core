import { TransactionRepository } from '../domain/transaction.repository';
import { Transaction } from '../domain/transaction.entity';

export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async save(transaction: Transaction): Promise<void> {
    const index = this.transactions.findIndex((t) => t.id === transaction.id);
    if (index !== -1) {
      this.transactions[index] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    return this.transactions.filter((t) => {
      // Accessing private props via hack or Assuming getProps/getter exists.
      // Since Transaction entity is clean, we can assume we check against domain getter if available or just internal logic.
      // But wait, Transaction entity `props` is protected.
      // In a real app we would use TypeORM or getters.
      // For InMemory, we can just cast to any to access props for filtering.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (t as any).props.walletId === walletId;
    });
  }
}
