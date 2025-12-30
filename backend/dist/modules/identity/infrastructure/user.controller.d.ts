import { CreateUserUseCase } from '../application/create-user.use-case';
import { CreateUserDto } from '../application/create-user.dto';
export declare class UserController {
    private readonly createUserUseCase;
    constructor(createUserUseCase: CreateUserUseCase);
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        role: import("../domain/user-role.enum").UserRole;
        isVerified: boolean;
        inviteCredits: number;
    }>;
}
