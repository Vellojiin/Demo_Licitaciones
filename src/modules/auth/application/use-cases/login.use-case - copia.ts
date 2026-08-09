import bcrypt from "bcrypt";

import { AuthUserRepository } from "";
import { InvalidCredentialError } from "@/src/modules/auth/domain/errors/invalid-credential.error";
import { AuthUser } from "@/src/modules/auth/domain/entities/auth-user.entity";

interface LoginInput {
    email: string;
    password: string;
}

export interface AuthSessionPayload {
    userId: string;
    role: string;
    email: string;
}

export class LoginUseCase {
    constructor(private readonly authUserRepository: AuthUserRepository) {}

    async execute(input: LoginInput): Promise<AuthSessionPayload> {
        const { email, password } = input;

        const user = await this.authUserRepository.findByEmail(email);
        if (!user) {
            throw new InvalidCredentialError();
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new InvalidCredentialError();
        }

        return {
            userId: user.id,
            role: user.role,
            email: user.email,
        };
    }
}