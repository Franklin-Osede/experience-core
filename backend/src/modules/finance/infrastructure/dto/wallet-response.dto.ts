import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from '../../domain/wallet.entity';

export class MoneyResponseDto {
  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  currency: string;

  @ApiProperty({ description: 'Formatted string representation' })
  formatted: string;
}

export class WalletResponseDto {
  @ApiProperty({ description: 'Wallet unique identifier' })
  id: string;

  @ApiProperty({ description: 'User ID who owns this wallet' })
  userId: string;

  @ApiProperty({ description: 'Available balance' })
  balance: MoneyResponseDto;

  @ApiProperty({ description: 'Locked balance (in Escrow)' })
  lockedBalance: MoneyResponseDto;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  /**
   * Maps a domain Wallet entity to WalletResponseDto
   */
  static fromDomain(wallet: Wallet): WalletResponseDto {
    const props = (wallet as any).props;
    return {
      id: wallet.id,
      userId: props.userId,
      balance: {
        amount: props.balance.amount,
        currency: props.balance.currency,
        formatted: props.balance.toString(),
      },
      lockedBalance: {
        amount: props.lockedBalance.amount,
        currency: props.lockedBalance.currency,
        formatted: props.lockedBalance.toString(),
      },
      updatedAt: props.updatedAt,
    };
  }
}
