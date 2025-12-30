import { SplitPayment } from './split-payment.entity';

export const SPLIT_PAYMENT_REPOSITORY = 'SPLIT_PAYMENT_REPOSITORY';

export interface SplitPaymentRepository {
  save(splitPayment: SplitPayment): Promise<void>;
  findById(id: string): Promise<SplitPayment | null>;
}
