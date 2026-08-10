import { NextResponse } from "next/server";
import { z } from "zod";

import { RegisterUseCase } from "@/src/modules/auth/application/use-cases/register.use-case";
import { UserAlreadyExistsError } from "@/src/modules/auth/domain/errors/user-already-exists.error";
import { PrismaAuthUserRepository } from "@/src/modules/auth/infrastructure/prisma-auth-user.repository";

const registerSchema = z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters long")
})

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedBody = registerSchema.parse(body);

        const repository = new PrismaAuthUserRepository();
        const useCase = new RegisterUseCase(repository);

        await useCase.execute({
            name: parsedBody.name,
            email: parsedBody.email,
            password: parsedBody.password
        });
        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ issues: error.issues }, { status: 400 });
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
        }
        
        if (error instanceof UserAlreadyExistsError) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}