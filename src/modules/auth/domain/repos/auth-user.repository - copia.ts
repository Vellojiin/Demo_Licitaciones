import { AuthUser } from "@/src/modules/auth/domain/entities/auth-user.entity";

export interface AuthUserRepository {
    findByEmail(email: string): Promise <AuthUser | null>;
}