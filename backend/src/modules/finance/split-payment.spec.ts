import { Test, TestingModule } from '@nestjs/testing';
import { CreateSplitPaymentUseCase } from './application/create-split-payment.use-case';
import { PaySplitShareUseCase } from './application/pay-split-share.use-case';
import { SPLIT_PAYMENT_REPOSITORY } from './domain/split-payment.repository';
import { InMemorySplitPaymentRepository } from './infrastructure/in-memory-split-payment.repository';
import { SplitPaymentStatus } from './domain/split-payment.entity';

describe('Split Payment Logic', () => {
  let createUseCase: CreateSplitPaymentUseCase;
  let payUseCase: PaySplitShareUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSplitPaymentUseCase,
        PaySplitShareUseCase,
        {
          provide: SPLIT_PAYMENT_REPOSITORY,
          useClass: InMemorySplitPaymentRepository,
        },
      ],
    }).compile();

    createUseCase = module.get<CreateSplitPaymentUseCase>(
      CreateSplitPaymentUseCase,
    );
    payUseCase = module.get<PaySplitShareUseCase>(PaySplitShareUseCase);
  });

  it('should split 100 EUR between 2 users correctly', async () => {
    const split = await createUseCase.execute({
      totalAmount: 10000, // 100.00 EUR (cents)
      currency: 'EUR',
      reason: 'Dinner',
      payerIds: ['user-1', 'user-2'],
    });

    expect(split.payers).toHaveLength(2);
    expect(split.payers[0].amount.amount).toBe(5000); // 50.00
    expect(split.payers[1].amount.amount).toBe(5000); // 50.00
    expect(split.status).toBe(SplitPaymentStatus.PENDING);
  });

  it('should split 100 EUR between 3 users (uneven split) correctly', async () => {
    const split = await createUseCase.execute({
      totalAmount: 10000,
      currency: 'EUR',
      reason: 'Drinks',
      payerIds: ['user-1', 'user-2', 'user-3'],
    });

    // 10000 / 3 = 3333.33...
    // Users: 3334, 3333, 3333 = 10000
    expect(split.payers[0].amount.amount).toBe(3334);
    expect(split.payers[1].amount.amount).toBe(3333);
    expect(split.payers[2].amount.amount).toBe(3333);
    expect(split.status).toBe(SplitPaymentStatus.PENDING);
  });

  it('should complete payment when ALL users pay', async () => {
    // 1. Create
    const split = await createUseCase.execute({
      totalAmount: 2000, // 20.00
      currency: 'EUR',
      reason: 'Taxi',
      payerIds: ['u1', 'u2'],
    });

    // 2. User 1 Pays
    await payUseCase.execute({
      splitPaymentId: split.id,
      userId: 'u1',
    });

    expect(split.payers.find((p) => p.userId === 'u1')?.isPaid).toBe(true);
    expect(split.status).toBe(SplitPaymentStatus.PENDING);

    // 3. User 2 Pays
    await payUseCase.execute({
      splitPaymentId: split.id,
      userId: 'u2',
    });

    expect(split.status).toBe(SplitPaymentStatus.COMPLETED);
  });
});
