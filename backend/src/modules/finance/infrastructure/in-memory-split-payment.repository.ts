import { Injectable } from '@nestjs/common';
import { SplitPaymentRepository } from '../domain/split-payment.repository';
import { SplitPayment } from '../domain/split-payment.entity';

@Injectable()
export class InMemorySplitPaymentRepository implements SplitPaymentRepository {
  private readonly items = new Map<string, SplitPayment>();

  save(splitPayment: SplitPayment): Promise<void> {
    this.items.set(splitPayment.id, splitPayment);
    return Promise.resolve();
  }

  findById(id: string): Promise<SplitPayment | null> {
    return Promise.resolve(this.items.get(id) || null);
  }
}
