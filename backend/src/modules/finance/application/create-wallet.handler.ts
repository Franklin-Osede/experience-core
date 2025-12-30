import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../identity/domain/events/user-created.event';
import { WalletRepository } from '../domain/wallet.repository';
import { Wallet } from '../domain/wallet.entity';

@Injectable()
export class CreateWalletHandler {
  constructor(
    @Inject('WalletRepository')
    private readonly walletRepository: WalletRepository,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: UserCreatedEvent) {
    console.log(
      `[Finance] Creating wallet for user ${payload.userId} (${payload.role})`,
    );

    // Create new wallet for the user
    const wallet = Wallet.create(payload.userId);

    await this.walletRepository.save(wallet);
    console.log(`[Finance] Wallet created: ${wallet.id}`);
  }
}
