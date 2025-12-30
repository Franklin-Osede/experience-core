import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../../domain/wallet.entity';
import { WalletRepository } from '../../domain/wallet.repository';
import { WalletEntity } from './wallet.entity';
import { Money } from '../../../../shared/domain/money.vo';

/**
 * TypeORM implementation of WalletRepository
 */
@Injectable()
export class TypeOrmWalletRepository implements WalletRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly typeOrmRepository: Repository<WalletEntity>,
  ) {}

  async save(wallet: Wallet): Promise<void> {
    const entity = this.toEntity(wallet);
    await this.typeOrmRepository.save(entity);
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { userId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toEntity(wallet: Wallet): WalletEntity {
    const props = (wallet as any).props;
    const entity = new WalletEntity();
    entity.id = wallet.id;
    entity.userId = props.userId;
    entity.balanceAmount = props.balance.amount;
    entity.balanceCurrency = props.balance.currency;
    entity.lockedBalanceAmount = props.lockedBalance.amount;
    entity.lockedBalanceCurrency = props.lockedBalance.currency;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: WalletEntity): Wallet {
    return Wallet.fromPersistence({
      id: entity.id,
      userId: entity.userId,
      balance: new Money(entity.balanceAmount, entity.balanceCurrency),
      lockedBalance: new Money(
        entity.lockedBalanceAmount,
        entity.lockedBalanceCurrency,
      ),
      updatedAt: entity.updatedAt,
    });
  }
}

