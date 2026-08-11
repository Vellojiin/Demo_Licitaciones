import { Prisma } from "@prisma/client";

import { prisma } from "@/src/infrastructure/prisma/prisma";
import { User } from "@/src/modules/users/domain/entities/user.entity";
import { UserCreateInput, UserRepository, UserUpdateInput } from "@/src/modules/users/domain/repos/user.repository";

function mapPrismaUserToDomain(user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    createdAt: Date;
    updatedAt: Date;
}): User {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export class PrismaUserRepository implements UserRepository {
    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return users.map(mapPrismaUserToDomain);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return null;
        }

        return mapPrismaUserToDomain(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return null;
        }

        return mapPrismaUserToDomain(user);
    }

    async create(input: UserCreateInput): Promise<User> {
        const created = await prisma.user.create({
            data: {
                id: input.id,
                name: input.name,
                email: input.email,
                passwordHash: input.passwordHash,
                role: input.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return mapPrismaUserToDomain(created);
    }

    async update(id: string, input: UserUpdateInput): Promise<User | null> {
        const existing = await prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) {
            return null;
        }

        const data: Prisma.UserUpdateInput = {
            name: input.name,
            email: input.email,
            passwordHash: input.passwordHash,
            role: input.role,
        };

        const updated = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return mapPrismaUserToDomain(updated);
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await prisma.user.deleteMany({
            where: { id },
        });

        return deleted.count > 0;
    }
}
