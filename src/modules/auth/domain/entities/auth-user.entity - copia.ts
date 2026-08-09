export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}