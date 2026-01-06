import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from './user.entity';
import { UserRole } from '../../domain/user-role.enum';
import { EventGenre } from '../../../event/domain/event-genre.enum';
import { Money } from '../../../../shared/domain/money.vo';
import * as bcrypt from 'bcrypt';

/**
 * TypeORM implementation of UserRepository
 * Maps between domain User entity and TypeORM UserEntity
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeOrmRepository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<void> {
    const entity = this.toEntity(user);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { email },
    });
    return entity ? this.toDomain(entity) : null;
  }

  private toEntity(user: User): UserEntity {
    const props = (user as any).props;
    const entity = new UserEntity();
    entity.id = user.id;
    entity.email = props.email;
    entity.password = props.password;
    entity.role = props.role;
    entity.isVerified = props.isVerified;
    entity.reputationScore = props.reputationScore;
    // Map Infinity to -1 for database storage (PostgreSQL doesn't support Infinity in integers)
    entity.inviteCredits =
      props.inviteCredits === Infinity ? -1 : props.inviteCredits;
    entity.eventsAttended = props.eventsAttended;
    entity.hasUnlockedInvites = props.hasUnlockedInvites;
    entity.outstandingDebtAmount = props.outstandingDebt.amount;
    entity.outstandingDebtCurrency = props.outstandingDebt.currency;
    entity.profilePhotoUrl = props.profilePhotoUrl || null;
    entity.isPhotoVerified = props.isPhotoVerified;
    entity.phoneNumber = props.phoneNumber || null;
    entity.preferredGenres = props.preferredGenres
      ? props.preferredGenres.map((g) => g.toString())
      : null;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: UserEntity): User {
    return User.fromPersistence({
      id: entity.id,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      isVerified: entity.isVerified,
      reputationScore: entity.reputationScore,
      // Map -1 back to Infinity for domain (DJs and FOUNDERs have unlimited invites)
      inviteCredits: entity.inviteCredits === -1 ? Infinity : entity.inviteCredits,
      eventsAttended: entity.eventsAttended,
      hasUnlockedInvites: entity.hasUnlockedInvites,
      outstandingDebt: new Money(
        entity.outstandingDebtAmount,
        entity.outstandingDebtCurrency,
      ),
      profilePhotoUrl: entity.profilePhotoUrl || undefined,
      isPhotoVerified: entity.isPhotoVerified,
      phoneNumber: entity.phoneNumber || undefined,
      preferredGenres: entity.preferredGenres
        ? (entity.preferredGenres.map(
            (g) => g as EventGenre,
          ) as EventGenre[])
        : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
