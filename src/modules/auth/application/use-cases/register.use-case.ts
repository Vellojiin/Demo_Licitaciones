import bcrypt from 'bcrypt';

import { AuthUser } from '@/src/modules/auth/domain/entities/auth-user.entity';
import { UserAlreadyExistsError } from '@/src/modules/auth/domain/errors/user-already-exists.error';
import { AuthUserRepository } from '@/src/modules/auth/domain/repos/auth-user.repository';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export class RegisterUseCase {
    constructor(private readonly authUserRepository: AuthUserRepository) {}

    async execute(input: RegisterInput): Promise<AuthUser> {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingUser = await this.authUserRepository.findByEmail(normalizedEmail);

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        const newUser: AuthUser = {
            id: crypto.randomUUID(),
            name: input.name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: 'USER',
        };

        await this.authUserRepository.create(newUser);

        return newUser;
    }
}