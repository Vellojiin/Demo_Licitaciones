import bcrypt from "bcrypt";

import { User } from "@/src/modules/users/domain/entities/user.entity";
import { UserRepository } from "@/src/modules/users/domain/repos/user.repository";
import { UserAlreadyExistsError } from "@/src/modules/auth/domain/errors/user-already-exists.error";

interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "USER";
}

export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: CreateUserInput): Promise<User> {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        return this.userRepository.create({
            id: crypto.randomUUID(),
            name: input.name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: input.role,
        });
    }
}
