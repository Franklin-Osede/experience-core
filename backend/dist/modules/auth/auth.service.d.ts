import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../identity/domain/user.repository';
import { User } from '../identity/domain/user.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: UserRepository, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<User | null>;
    login(user: {
        email: string;
        id: string;
        role: string;
    }): Promise<{
        access_token: string;
    }>;
}
