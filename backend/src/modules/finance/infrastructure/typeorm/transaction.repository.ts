import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../domain/transaction.repository';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionEntity as TypeOrmTransactionEntity } from './transaction.entity';
import { TransactionMapper } from './transaction.mapper';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TypeOrmTransactionEntity)
    private readonly repository: Repository<TypeOrmTransactionEntity>,
  ) {}

  async save(transaction: Transaction): Promise<void> {
    const entity = TransactionMapper.toPersistence(transaction);
    await this.repository.save(entity);
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(TransactionMapper.toDomain);
  }
}
