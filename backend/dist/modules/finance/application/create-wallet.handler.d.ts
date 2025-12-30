import { UserCreatedEvent } from '../../identity/domain/events/user-created.event';
import { WalletRepository } from '../domain/wallet.repository';
export declare class CreateWalletHandler {
    private readonly walletRepository;
    constructor(walletRepository: WalletRepository);
    handleUserCreatedEvent(payload: UserCreatedEvent): Promise<void>;
}
