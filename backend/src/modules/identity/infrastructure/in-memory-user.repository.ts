import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  save(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }
}
