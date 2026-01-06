import { ApiProperty } from '@nestjs/swagger';
import { SplitPayment } from '../../domain/split-payment.entity';

export class SplitPaymentPayerResponseDto {
  @ApiProperty({ description: 'User ID of the payer' })
  userId: string;

  @ApiProperty({ description: 'Amount to pay' })
  amount: {
    amount: number;
    currency: string;
    formatted: string;
  };

  @ApiProperty({ description: 'Whether this payer has paid' })
  isPaid: boolean;

  @ApiProperty({ description: 'Date when payment was made', nullable: true })
  paidAt: Date | null;
}

export class SplitPaymentResponseDto {
  @ApiProperty({ description: 'Split payment unique identifier' })
  id: string;

  @ApiProperty({ description: 'Total amount to split' })
  totalAmount: {
    amount: number;
    currency: string;
    formatted: string;
  };

  @ApiProperty({ description: 'Reason for the split payment' })
  reason: string;

  @ApiProperty({ description: 'Current status of the split payment' })
  status: string;

  @ApiProperty({
    description: 'List of payers and their payment status',
    type: [SplitPaymentPayerResponseDto],
  })
  payers: SplitPaymentPayerResponseDto[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  /**
   * Maps a domain SplitPayment entity to SplitPaymentResponseDto
   */
  static fromDomain(splitPayment: SplitPayment): SplitPaymentResponseDto {
    // Access props through getProps() from Entity base class
    const props = splitPayment.getProps();
    const totalAmount = splitPayment.payers.reduce(
      (sum, p) => sum + p.amount.amount,
      0,
    );
    const currency = splitPayment.payers[0]?.amount.currency || 'EUR';

    return {
      id: splitPayment.id,
      totalAmount: {
        amount: totalAmount,
        currency,
        formatted: `${(totalAmount / 100).toFixed(2)} ${currency}`,
      },
      reason: props.reason,
      status: splitPayment.status,
      payers: splitPayment.payers.map((p) => ({
        userId: p.userId,
        amount: {
          amount: p.amount.amount,
          currency: p.amount.currency,
          formatted: p.amount.toString(),
        },
        isPaid: p.isPaid,
        paidAt: p.paidAt || null,
      })),
      createdAt: props.createdAt,
    };
  }
}

