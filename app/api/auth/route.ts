import { NextResponse } from "next/server";
import { z } from "zod";
import { LoginUseCase } from "@/src/modules/auth/application/use-cases/login.use-case";
import { InvalidCredentialError } from "@/src/modules/auth/domain/errors/invalid-credential.error";
import { PrismaAuthUserRepository } from "@/src/modules/auth/infrastructure/prisma-auth-user.repository";
import { signAuthToken } from "@/src/modules/auth/jwt";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const requestBody = await request.json();
        const parsedBody = loginSchema.parse(requestBody);

        const repository = new PrismaAuthUserRepository();
        const useCase = new LoginUseCase(repository);
        const session = await useCase.execute(parsedBody);
        const token = signAuthToken(session);

        const response = NextResponse.json({
            user:{
                id: session.userId,
                name: session.name,
                email: session.email,
                role: session.role,
            },
        },
        { status: 200 }
    );

    response.cookies.set({
        name: "access_token",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
    })
    return response;
    } catch (error) {
    if (error instanceof InvalidCredentialError) {
        return NextResponse.json({ message: error.message }, { status: 401 });
        }

    if (error instanceof z.ZodError) {
        return NextResponse.json({ issues: error.issues }, { status: 422 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}