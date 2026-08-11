import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { DeleteClientUseCase } from "@/src/modules/clients/application/use-cases/delete-client.use-case";
import { UpdateClientUseCase } from "@/src/modules/clients/application/use-cases/update-client.use-case";
import { PrismaClientRepository } from "@/src/modules/clients/infrastructure/repos/prisma-client.repository";

const updateClientSchema = z.object({
    companyName: z.string().trim().min(1, "companyName is required").optional(),
    contactName: z.string().trim().optional().nullable(),
    email: z.string().trim().email("Invalid email").optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaClientRepository();
        const client = await repository.findById(id);

        if (!client) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json(client, { status: 200 });
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
        const { id } = await params;
        const body = await request.json();
        const data = updateClientSchema.parse(body);

        const repository = new PrismaClientRepository();
        const useCase = new UpdateClientUseCase(repository);
        const updatedClient = await useCase.execute({
            id,
            companyName: data.companyName,
            contactName: data.contactName,
            email: data.email,
            userId: session.userId,
        });

        if (!updatedClient) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json(updatedClient, { status: 200 });
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
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaClientRepository();
        const useCase = new DeleteClientUseCase(repository);
        const deleted = await useCase.execute({ id });

        if (!deleted) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
