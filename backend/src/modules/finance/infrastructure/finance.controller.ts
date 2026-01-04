import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetWalletUseCase } from '../application/get-wallet.use-case';
import { DepositWalletUseCase } from '../application/deposit-wallet.use-case';
import { CreateSplitPaymentUseCase } from '../application/create-split-payment.use-case';
import { PaySplitShareUseCase } from '../application/pay-split-share.use-case';
import { IsNotEmpty, IsString, IsNumber, IsArray, Min } from 'class-validator';

interface AuthenticatedRequest {
  user?: {
    id: string;
  };
}

class DepositWalletDto {
  @IsNumber()
  @Min(1)
  amount: number; // in cents

  @IsString()
  @IsNotEmpty()
  currency: string;
}

class CreateSplitPaymentDto {
  @IsNumber()
  @Min(1)
  totalAmount: number; // in cents

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsArray()
  @IsString({ each: true })
  payerIds: string[];
}

class PaySplitShareDto {
  @IsString()
  @IsNotEmpty()
  splitPaymentId: string;
}

@ApiTags('Finance')
@Controller('finance')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FinanceController {
  constructor(
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly depositWalletUseCase: DepositWalletUseCase,
    private readonly createSplitPaymentUseCase: CreateSplitPaymentUseCase,
    private readonly paySplitShareUseCase: PaySplitShareUseCase,
  ) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Wallet information returned',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWallet(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const wallet = await this.getWalletUseCase.execute(userId);

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: {
        amount: wallet.balance.amount,
        currency: wallet.balance.currency,
        formatted: wallet.balance.toString(),
      },
      lockedBalance: {
        amount: wallet.lockedBalance.amount,
        currency: wallet.lockedBalance.currency,
        formatted: wallet.lockedBalance.toString(),
      },
      updatedAt: (wallet as any).props.updatedAt,
    };
  }

  @Post('wallet/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit funds to wallet (simulated for MVP)' })
  @ApiResponse({
    status: 200,
    description: 'Funds deposited successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async deposit(
    @Request() req: AuthenticatedRequest,
    @Body() dto: DepositWalletDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const wallet = await this.depositWalletUseCase.execute({
      userId,
      ...dto,
    });

    return {
      id: wallet.id,
      balance: {
        amount: wallet.balance.amount,
        currency: wallet.balance.currency,
        formatted: wallet.balance.toString(),
      },
      message: 'Funds deposited successfully',
    };
  }

  @Post('split-payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a split payment' })
  @ApiResponse({
    status: 201,
    description: 'Split payment created successfully',
  })
  async createSplitPayment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSplitPaymentDto,
  ) {
    const splitPayment = await this.createSplitPaymentUseCase.execute(dto);

    return {
      id: splitPayment.id,
      totalAmount: {
        amount: splitPayment.payers.reduce(
          (sum, p) => sum + (p.amount as any).amount,
          0,
        ),
        currency: (splitPayment.payers[0]?.amount as any)?.currency || 'EUR',
      },
      reason: (splitPayment as any).props.reason,
      status: splitPayment.status,
      payers: splitPayment.payers.map((p) => ({
        userId: p.userId,
        amount: {
          amount: (p.amount as any).amount,
          currency: (p.amount as any).currency,
        },
        isPaid: p.isPaid,
        paidAt: p.paidAt,
      })),
      createdAt: (splitPayment as any).props.createdAt,
    };
  }

  @Post('split-payments/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay your share of a split payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment recorded successfully',
  })
  @ApiResponse({ status: 404, description: 'Split payment not found' })
  async paySplitShare(
    @Request() req: AuthenticatedRequest,
    @Body() dto: PaySplitShareDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const splitPayment = await this.paySplitShareUseCase.execute({
      splitPaymentId: dto.splitPaymentId,
      userId,
    });

    return {
      id: splitPayment.id,
      status: splitPayment.status,
      payers: splitPayment.payers.map((p) => ({
        userId: p.userId,
        isPaid: p.isPaid,
        paidAt: p.paidAt,
      })),
      message: 'Payment recorded successfully',
    };
  }
}
