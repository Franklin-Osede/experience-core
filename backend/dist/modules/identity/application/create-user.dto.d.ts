import { UserRole } from '../domain/user-role.enum';
export declare class CreateUserDto {
    email: string;
    role: UserRole;
    password: string;
}
