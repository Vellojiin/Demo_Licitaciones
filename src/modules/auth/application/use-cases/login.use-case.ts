import bcrypt from "bcrypt";

import { AuthUserRepository } from "@/src/modules/auth/domain/repos/auth-user.repository";
import { InvalidCredentialError } from "@/src/modules/auth/domain/errors/invalid-credential.error";
import { UserRole } from "@/src/modules/auth/domain/entities/auth-user.entity";

interface LoginInput {
    email: string;
    password: string;

}

export interface AuthSessionPayload {
    userId: string;
    name: string;
    role: UserRole;
    email: string;
}

export class LoginUseCase {
    constructor(private readonly authUserRepository: AuthUserRepository) {}

    async execute(input: LoginInput): Promise<AuthSessionPayload> {
        const { email } = input;

        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.authUserRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new InvalidCredentialError();
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new InvalidCredentialError();
        }

        return {
            userId: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
        };
    }
}