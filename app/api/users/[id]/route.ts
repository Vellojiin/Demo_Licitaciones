import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { DeleteUserUseCase } from "@/src/modules/users/application/use-cases/delete-user.use-case";
import { UpdateUserUseCase } from "@/src/modules/users/application/use-cases/update-user.use-case";
import { PrismaUserRepository } from "@/src/modules/users/infrastructure/repos/prisma-user.repository";

const updateUserSchema = z
    .object({
        name: z.string().trim().min(2, "Name is required").optional(),
        email: z.string().trim().email("Invalid email address").optional(),
        password: z.string().trim().min(6, "Password must be at least 6 characters long").optional(),
        role: z.enum(["ADMIN", "USER"]).optional(),
    })
    .refine(
        (data) => data.name !== undefined || data.email !== undefined || data.password !== undefined || data.role !== undefined,
        { message: "At least one field is required to update" }
    );

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        if (session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const repository = new PrismaUserRepository();
        const user = await repository.findById(id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        if (session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const data = updateUserSchema.parse(body);

        const repository = new PrismaUserRepository();
        const useCase = new UpdateUserUseCase(repository);
        const user = await useCase.execute({
            id,
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
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

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        if (session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        if (session.userId === id) {
            return NextResponse.json({ message: "You cannot delete your own user" }, { status: 400 });
        }

        const repository = new PrismaUserRepository();
        const useCase = new DeleteUserUseCase(repository);
        const deleted = await useCase.execute({ id });

        if (!deleted) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
