import { Transaction } from '../../domain/transaction.entity';
import { TransactionEntity } from './transaction.entity';
import { TransactionType as DomainTransactionType } from '../../domain/transaction-type.enum';
import { TransactionType as TypeOrmTransactionType } from './transaction.entity';
import { Money } from '../../../../shared/domain/money.vo';

export class TransactionMapper {
  static toPersistence(domain: Transaction): TransactionEntity {
    const entity = new TransactionEntity();

    const props: any = (domain as any).props;

    entity.id = domain.id;
    entity.walletId = props.walletId;
    entity.amount = props.amount.amount; // Store as number (cents)
    entity.currency = props.amount.currency;
    entity.type = props.type as unknown as TypeOrmTransactionType; // Should verify enum match
    entity.referenceId = props.referenceId;
    entity.createdAt = props.createdAt;
    entity.description = ''; // Default

    return entity;
  }

  static toDomain(entity: TransactionEntity): Transaction {
    return Transaction.fromPersistence({
      id: entity.id,
      walletId: entity.walletId,
      amount: new Money(Number(entity.amount), entity.currency),
      type: entity.type as unknown as DomainTransactionType,
      referenceId: entity.referenceId || '', // Handle null if necessary
      createdAt: entity.createdAt,
    });
  }
}
