import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
export declare class InMemoryUserRepository implements UserRepository {
    private users;
    save(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
