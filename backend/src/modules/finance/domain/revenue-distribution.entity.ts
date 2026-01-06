
import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { UserRole } from '../../identity/domain/user-role.enum';
import { v4 as uuidv4 } from 'uuid';

export enum DistributionStatus {
  CALCULATED = 'CALCULATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED', // Requires manual intervention
}

export interface RecipientShare {
  recipientId: string; // The User ID (DJ, Venue Owner, Provider)
  role: UserRole;
  amount: Money;
  status: 'PENDING' | 'PAID' | 'FAILED';
  payoutTxId?: string; // Reference to the actual banking transaction
}

export interface RevenueDistributionProps {
  eventId: string;
  totalRevenue: Money;
  platformFee: Money;
  netRevenue: Money; // Revenue after platform fee
  recipients: RecipientShare[];
  status: DistributionStatus;
  calculatedAt: Date;
  processedAt?: Date;
}

export class RevenueDistribution extends Entity<RevenueDistributionProps> {
  private constructor(id: string, props: RevenueDistributionProps) {
    super(id, props);
  }

  static calculate(
    eventId: string,
    totalRevenue: Money,
    platformFeePercentage: number, // e.g. 0.10 for 10%
    costs: { recipientId: string; amount: number; role: UserRole }[], // Fixed costs (Rentals, fees)
  ): RevenueDistribution {
    const id = uuidv4();
    const now = new Date();

    // 1. Calculate Platform Fee
    const feeAmount = Math.round(totalRevenue.amount * platformFeePercentage);
    const platformFee = new Money(feeAmount, totalRevenue.currency);

    // 2. Calculate Net Revenue (Pot to distribute)
    // Note: In real life, costs might come BEFORE fee or AFTER.
    // Standard model: Platform takes fee on GROSS.
    const netAmount = totalRevenue.amount - feeAmount;
    const netRevenue = new Money(netAmount, totalRevenue.currency);

    // 3. Allocate Costs (Providers, Venue Fixed Fee)
    const recipients: RecipientShare[] = [];
    let remainingAmount = netAmount;

    for (const cost of costs) {
      if (remainingAmount < cost.amount) {
        throw new Error('Not enough revenue to cover fixed costs!');
      }
      recipients.push({
        recipientId: cost.recipientId,
        role: cost.role,
        amount: new Money(cost.amount, totalRevenue.currency),
        status: 'PENDING',
      });
      remainingAmount -= cost.amount;
    }

    // 4. Who gets the rest? The Organizer (Profit)
    // In some models, the DJ gets a % split of the profit. This logic can be extended.
    // For now, let's say the rest goes to a "Profit Pool" or main organizer.
    // We would need an explicit 'Organizer' recipient passed in costs or separate argument.
    // For MVP, simplistic: Assume 'costs' includes everyone's share.
    
    return new RevenueDistribution(id, {
      eventId,
      totalRevenue,
      platformFee,
      netRevenue,
      recipients,
      status: DistributionStatus.CALCULATED,
      calculatedAt: now,
    });
  }

  public markProcessed(): void {
    this.props.status = DistributionStatus.COMPLETED;
    this.props.processedAt = new Date();
    this.props.recipients.forEach((r) => (r.status = 'PAID'));
  }
}
