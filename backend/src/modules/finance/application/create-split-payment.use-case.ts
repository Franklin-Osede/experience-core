import { Inject, Injectable } from '@nestjs/common';
import {
  SPLIT_PAYMENT_REPOSITORY,
  SplitPaymentRepository,
} from '../domain/split-payment.repository';
import { SplitPayment } from '../domain/split-payment.entity';
import { Money } from '../../../shared/domain/money.vo';

interface CreateSplitDto {
  totalAmount: number;
  currency: string;
  reason: string;
  payerIds: string[];
}

@Injectable()
export class CreateSplitPaymentUseCase {
  constructor(
    @Inject(SPLIT_PAYMENT_REPOSITORY)
    private readonly repository: SplitPaymentRepository,
  ) {}

  async execute(dto: CreateSplitDto): Promise<SplitPayment> {
    const totalMoney = new Money(dto.totalAmount, dto.currency);

    const splitPayment = SplitPayment.create(
      totalMoney,
      dto.reason,
      dto.payerIds,
    );

    await this.repository.save(splitPayment);

    // In a real system, we would trigger an Event here: 'SplitPaymentCreated'
    // This would send notifications to all payers: "You owe X for Table Y"

    return splitPayment;
  }
}
