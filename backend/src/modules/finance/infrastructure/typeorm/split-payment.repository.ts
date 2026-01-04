import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SplitPayment } from '../../domain/split-payment.entity';
import { SplitPaymentRepository } from '../../domain/split-payment.repository';
import { SplitPaymentEntity } from './split-payment.entity';
import { SplitPaymentPayerEntity } from './split-payment-payer.entity';
import { Money } from '../../../../shared/domain/money.vo';

@Injectable()
export class TypeOrmSplitPaymentRepository implements SplitPaymentRepository {
  constructor(
    @InjectRepository(SplitPaymentEntity)
    private readonly splitPaymentRepository: Repository<SplitPaymentEntity>,
    @InjectRepository(SplitPaymentPayerEntity)
    private readonly payerRepository: Repository<SplitPaymentPayerEntity>,
  ) {}

  async save(splitPayment: SplitPayment): Promise<void> {
    const entity = this.toEntity(splitPayment);
    await this.splitPaymentRepository.save(entity);

    // Save/update payers
    const payers = (splitPayment as any).props.payers;
    const existingPayers = await this.payerRepository.find({
      where: { splitPaymentId: splitPayment.id },
    });

    // Delete payers that are no longer in the list
    const currentUserIds = payers.map((p: any) => p.userId);
    const payersToDelete = existingPayers.filter(
      (p) => !currentUserIds.includes(p.userId),
    );
    if (payersToDelete.length > 0) {
      await this.payerRepository.remove(payersToDelete);
    }

    // Save/update payers
    for (const payer of payers) {
      const existingPayer = existingPayers.find(
        (p) => p.userId === payer.userId,
      );
      const payerEntity = existingPayer || new SplitPaymentPayerEntity();

      if (!existingPayer) {
        payerEntity.id = `${splitPayment.id}-${payer.userId}`;
        payerEntity.splitPaymentId = splitPayment.id;
        payerEntity.userId = payer.userId;
      }

      payerEntity.amount = payer.amount.amount;
      payerEntity.currency = payer.amount.currency;
      payerEntity.isPaid = payer.isPaid;
      payerEntity.paidAt = payer.paidAt || null;
      await this.payerRepository.save(payerEntity);
    }
  }

  async findById(id: string): Promise<SplitPayment | null> {
    const entity = await this.splitPaymentRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    // Load payers separately
    const payers = await this.payerRepository.find({
      where: { splitPaymentId: id },
    });

    return this.toDomain(entity, payers);
  }

  private toEntity(splitPayment: SplitPayment): SplitPaymentEntity {
    const props = (splitPayment as any).props;
    const entity = new SplitPaymentEntity();
    entity.id = splitPayment.id;
    entity.totalAmount = props.totalAmount.amount;
    entity.currency = props.totalAmount.currency;
    entity.reason = props.reason;
    entity.status = props.status;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(
    entity: SplitPaymentEntity,
    payers: SplitPaymentPayerEntity[],
  ): SplitPayment {
    const payerStatuses = payers.map((p) => ({
      userId: p.userId,
      amount: new Money(p.amount, p.currency),
      isPaid: p.isPaid,
      paidAt: p.paidAt || undefined,
    }));

    return SplitPayment.fromPersistence({
      id: entity.id,
      totalAmount: new Money(entity.totalAmount, entity.currency),
      reason: entity.reason,
      payers: payerStatuses,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
