import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { ListTenderUseCase } from "@/src/modules/tenders/application/use-cases/list-tender.use-case";
import { CreateTenderUseCase } from "@/src/modules/tenders/application/use-cases/create-tender.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

const createTenderSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional(),
    maxBudget: z.coerce.number().positive("Max budget must be a positive number"),
    deadline: z.coerce.date(),
    clientId: z.string().trim().min(1, "Client ID is required")
});

export async function POST(request: Request) {
    try{
        const session = await requireAuth();
        const body = await request.json();
        const data = createTenderSchema.parse(body);

        const repository = new PrismaTenderRepository();
        const useCase = new CreateTenderUseCase(repository);
        const tender = await useCase.execute({
            title: data.title,
            description: data.description,
            maxBudget: data.maxBudget,
            deadline: data.deadline,
            clientId: data.clientId,
            userId: session.userId
        });
        return NextResponse.json(tender, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ issues: error.issues }, { status: 422 });
        }
        
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try{
        await requireAuth();

        const repository = new PrismaTenderRepository();
        const useCase = new ListTenderUseCase(repository);
        const tenders = await useCase.execute();
        return NextResponse.json(tenders, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}