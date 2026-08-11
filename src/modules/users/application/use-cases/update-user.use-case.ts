import bcrypt from "bcrypt";

import { User } from "@/src/modules/users/domain/entities/user.entity";
import { UserRepository } from "@/src/modules/users/domain/repos/user.repository";

interface UpdateUserInput {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "USER";
}

export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: UpdateUserInput): Promise<User | null> {
        const updateData: {
            name?: string;
            email?: string;
            passwordHash?: string;
            role?: "ADMIN" | "USER";
        } = {};

        if (typeof input.name === "string") {
            updateData.name = input.name.trim();
        }

        if (typeof input.email === "string") {
            updateData.email = input.email.trim().toLowerCase();
        }

        if (typeof input.password === "string" && input.password.length > 0) {
            updateData.passwordHash = await bcrypt.hash(input.password, 10);
        }

        if (input.role) {
            updateData.role = input.role;
        }

        return this.userRepository.update(input.id, updateData);
    }
}
