import { Entity } from '../../../shared/domain/entity.base';
import { UserRole } from './user-role.enum';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export interface UserProps {
  email: string;
  password: string; // Hashed password
  role: UserRole;
  isVerified: boolean;
  reputationScore: number;
  inviteCredits: number;
  eventsAttended: number; // Track participation
  hasUnlockedInvites: boolean; // For launch phase users
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  private constructor(id: string, props: UserProps) {
    super(id, props);
  }

  static create(
    props: Omit<
      UserProps,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'reputationScore'
      | 'isVerified'
      | 'inviteCredits'
      | 'eventsAttended'
      | 'hasUnlockedInvites'
    >,
  ): User {
    const id = uuidv4();
    const now = new Date();

    // Hybrid Launch Model:
    // - DJs: Unlimited (they build community)
    // - FOUNDER: 10 invites (early adopters, launch phase)
    // - FAN: 0 initially, unlock 3 after first event
    let initialInvites: number;
    let hasUnlockedInvites: boolean;

    if (props.role === UserRole.DJ) {
      initialInvites = Infinity;
      hasUnlockedInvites = true; // DJs always have access
    } else if (props.role === UserRole.FOUNDER) {
      initialInvites = 10; // Founding members get more
      hasUnlockedInvites = true;
    } else {
      // FANs start with 0, unlock after first event
      initialInvites = 0;
      hasUnlockedInvites = false;
    }

    return new User(id, {
      ...props,
      isVerified: false,
      reputationScore: 0,
      inviteCredits: initialInvites,
      eventsAttended: 0,
      hasUnlockedInvites,
      createdAt: now,
      updatedAt: now,
    });
  }

  public verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  public markEventAttended(): void {
    this.props.eventsAttended += 1;
    this.props.updatedAt = new Date();

    // Business Rule: After first event, unlock invites for FANs
    if (
      !this.props.hasUnlockedInvites &&
      this.props.eventsAttended >= 1 &&
      this.props.role === UserRole.FAN
    ) {
      this.unlockInvites();
    }
  }

  private unlockInvites(): void {
    this.props.inviteCredits = 3; // Grant 3 invites
    this.props.hasUnlockedInvites = true;
    this.props.updatedAt = new Date();
  }

  public useInvite(): void {
    if (this.props.inviteCredits === Infinity) {
      return; // DJs have unlimited
    }

    if (this.props.inviteCredits <= 0) {
      throw new Error('No invite credits available');
    }

    this.props.inviteCredits -= 1;
    this.props.updatedAt = new Date();
  }

  public increaseReputation(points: number): void {
    this.props.reputationScore += points;
    this.props.updatedAt = new Date();
  }

  public decreaseReputation(points: number): void {
    this.props.reputationScore = Math.max(
      0,
      this.props.reputationScore - points,
    );
    this.props.updatedAt = new Date();
  }

  public async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.props.password);
  }

  // Getters
  get email(): string {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get reputationScore(): number {
    return this.props.reputationScore;
  }

  get inviteCredits(): number {
    return this.props.inviteCredits;
  }

  get eventsAttended(): number {
    return this.props.eventsAttended;
  }

  get hasUnlockedInvites(): boolean {
    return this.props.hasUnlockedInvites;
  }
}
