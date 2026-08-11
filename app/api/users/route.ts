import { NextResponse } from "next/server";
import { z } from "zod";

import { UserAlreadyExistsError } from "@/src/modules/auth/domain/errors/user-already-exists.error";
import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { CreateUserUseCase } from "@/src/modules/users/application/use-cases/create-user.use-case";
import { ListUsersUseCase } from "@/src/modules/users/application/use-cases/list-users.use-case";
import { PrismaUserRepository } from "@/src/modules/users/infrastructure/repos/prisma-user.repository";

const createUserSchema = z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export async function GET() {
    try {
        const session = await requireAuth();
        if (session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const repository = new PrismaUserRepository();
        const useCase = new ListUsersUseCase(repository);
        const users = await useCase.execute();

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        if (session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const data = createUserSchema.parse(body);

        const repository = new PrismaUserRepository();
        const useCase = new CreateUserUseCase(repository);
        const user = await useCase.execute({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ issues: error.issues }, { status: 422 });
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
        }

        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof UserAlreadyExistsError) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
