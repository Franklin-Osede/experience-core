import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SPLIT_PAYMENT_REPOSITORY,
  SplitPaymentRepository,
} from '../domain/split-payment.repository';
import { SplitPayment } from '../domain/split-payment.entity';

interface PayShareDto {
  splitPaymentId: string;
  userId: string;
}

@Injectable()
export class PaySplitShareUseCase {
  constructor(
    @Inject(SPLIT_PAYMENT_REPOSITORY)
    private readonly repository: SplitPaymentRepository,
  ) {}

  async execute(dto: PayShareDto): Promise<SplitPayment> {
    const splitPayment = await this.repository.findById(dto.splitPaymentId);

    if (!splitPayment) {
      throw new NotFoundException(
        `Split payment with ID ${dto.splitPaymentId} not found`,
      );
    }

    // Capture Payment Logic:
    // In a real app, here we would call `PaymentGateway.capture(amount)`
    // If successful, we record it.

    splitPayment.recordPayment(dto.userId);

    await this.repository.save(splitPayment);

    return splitPayment;
  }
}
