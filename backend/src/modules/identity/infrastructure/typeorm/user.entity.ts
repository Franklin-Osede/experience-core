import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';
import { UserRole } from '../../domain/user-role.enum';

/**
 * TypeORM Entity for User persistence
 * This is separate from the domain User entity to maintain DDD boundaries
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Check(`"reputationScore" >= 0`)
@Check(`"inviteCredits" >= 0 OR "inviteCredits" = -1`) // -1 represents Infinity
@Check(`"eventsAttended" >= 0`)
@Check(`"outstandingDebtAmount" >= 0`)
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string; // Hashed

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FAN,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'int', default: 0 })
  reputationScore: number;

  @Column({ type: 'int', default: 0 })
  inviteCredits: number;

  @Column({ type: 'int', default: 0 })
  eventsAttended: number;

  @Column({ default: false })
  hasUnlockedInvites: boolean;

  // Outstanding debt stored as cents
  @Column({ type: 'bigint', default: 0 })
  outstandingDebtAmount: number;

  @Column({ length: 3, default: 'EUR' })
  outstandingDebtCurrency: string;

  @Column({ nullable: true, length: 500 })
  profilePhotoUrl: string | null;

  @Column({ default: false })
  isPhotoVerified: boolean;

  @Column({ nullable: true, length: 20 })
  phoneNumber: string | null;

  @Column({ type: 'simple-array', nullable: true })
  preferredGenres: string[] | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  currentChallenge: string | null;

  @Column('simple-json', { nullable: true }) // Using simple-json for broader compatibility if not PG
  authenticators: any[] | null;
}
