export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}