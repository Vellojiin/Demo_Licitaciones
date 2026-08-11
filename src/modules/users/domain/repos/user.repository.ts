import { User, UserRole } from "@/src/modules/users/domain/entities/user.entity";

export interface UserCreateInput {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}

export interface UserUpdateInput {
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: UserRole;
}

export interface UserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: UserCreateInput): Promise<User>;
    update(id: string, input: UserUpdateInput): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
