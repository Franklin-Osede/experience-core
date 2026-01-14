import { Entity } from '../../../shared/domain/entity.base';
import { UserRole } from './user-role.enum';
import { Money } from '../../../shared/domain/money.vo';
import { EventGenre } from '../../event/domain/event-genre.enum';
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
  outstandingDebt: Money;
  profilePhotoUrl?: string; // New: Face check
  isPhotoVerified: boolean; // New: Bouncer verified
  phoneNumber?: string; // Phone number for verification
  preferredGenres?: EventGenre[]; // User's preferred music genres
  createdAt: Date;
  updatedAt: Date;
  // WebAuthn
  currentChallenge?: string;
  authenticators?: any[]; // Simplified for now, will strict type later
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
      | 'outstandingDebt'
      | 'isPhotoVerified' // Auto-set to false
      | 'profilePhotoUrl' // Optional initially
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
      outstandingDebt: new Money(0, 'EUR'),
      isPhotoVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstructs a User entity from persistence data
   * Used by repositories to map from database entities
   */
  static fromPersistence(props: UserProps & { id: string }): User {
    return new User(props.id, {
      email: props.email,
      password: props.password,
      role: props.role,
      isVerified: props.isVerified,
      reputationScore: props.reputationScore,
      inviteCredits: props.inviteCredits,
      eventsAttended: props.eventsAttended,
      hasUnlockedInvites: props.hasUnlockedInvites,
      outstandingDebt: props.outstandingDebt,
      profilePhotoUrl: props.profilePhotoUrl,
      isPhotoVerified: props.isPhotoVerified,
      phoneNumber: props.phoneNumber,
      preferredGenres: props.preferredGenres,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      currentChallenge: props.currentChallenge,
      authenticators: props.authenticators,
    });
  }

  public verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  public updateProfilePhoto(url: string): void {
    this.props.profilePhotoUrl = url;
    // Reset verification if photo changes? Strict rule: Yes.
    this.props.isPhotoVerified = false;
    this.props.updatedAt = new Date();
  }

  public verifyPhoto(): void {
    if (!this.props.profilePhotoUrl) {
      throw new Error('Cannot verify user without a profile photo');
    }
    this.props.isPhotoVerified = true;
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

  public recordDebt(amount: Money): void {
    this.props.outstandingDebt = this.props.outstandingDebt.add(amount);
    this.props.updatedAt = new Date();
  }

  public clearDebt(): void {
    this.props.outstandingDebt = new Money(
      0,
      this.props.outstandingDebt.currency,
    );
    this.props.updatedAt = new Date();
  }

  public updatePhoneNumber(phoneNumber: string): void {
    this.props.phoneNumber = phoneNumber;
    this.props.updatedAt = new Date();
  }

  public updatePreferredGenres(genres: EventGenre[]): void {
    this.props.preferredGenres = genres;
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

  get outstandingDebt(): Money {
    return this.props.outstandingDebt;
  }

  get profilePhotoUrl(): string | undefined {
    return this.props.profilePhotoUrl;
  }

  get isPhotoVerified(): boolean {
    return this.props.isPhotoVerified;
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  get preferredGenres(): EventGenre[] | undefined {
    return this.props.preferredGenres;
  }

  // WebAuthn Methods
  public setChallenge(challenge: string | undefined): void {
    this.props.currentChallenge = challenge;
    this.props.updatedAt = new Date();
  }

  public get currentChallenge(): string | undefined {
    return this.props.currentChallenge;
  }

  public addAuthenticator(authenticator: any): void {
    if (!this.props.authenticators) {
      this.props.authenticators = [];
    }
    this.props.authenticators.push(authenticator);
    this.props.updatedAt = new Date();
  }

  public get authenticators(): any[] {
    return this.props.authenticators || [];
  }
}
