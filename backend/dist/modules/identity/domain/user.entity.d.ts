import { Entity } from '../../../shared/domain/entity.base';
import { UserRole } from './user-role.enum';
export interface UserProps {
    email: string;
    password: string;
    role: UserRole;
    isVerified: boolean;
    reputationScore: number;
    inviteCredits: number;
    eventsAttended: number;
    hasUnlockedInvites: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class User extends Entity<UserProps> {
    private constructor();
    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'reputationScore' | 'isVerified' | 'inviteCredits' | 'eventsAttended' | 'hasUnlockedInvites'>): User;
    verify(): void;
    markEventAttended(): void;
    private unlockInvites;
    useInvite(): void;
    increaseReputation(points: number): void;
    decreaseReputation(points: number): void;
    validatePassword(plain: string): Promise<boolean>;
    get email(): string;
    get role(): UserRole;
    get isVerified(): boolean;
    get reputationScore(): number;
    get inviteCredits(): number;
    get eventsAttended(): number;
    get hasUnlockedInvites(): boolean;
}
