import { Injectable } from '@nestjs/common';
import { SplitPaymentRepository } from '../domain/split-payment.repository';
import { SplitPayment } from '../domain/split-payment.entity';

@Injectable()
export class InMemorySplitPaymentRepository implements SplitPaymentRepository {
  private readonly items = new Map<string, SplitPayment>();

  async save(splitPayment: SplitPayment): Promise<void> {
    this.items.set(splitPayment.id, splitPayment);
  }

  async findById(id: string): Promise<SplitPayment | null> {
    return this.items.get(id) || null;
  }
}
