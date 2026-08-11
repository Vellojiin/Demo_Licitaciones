import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { RegisterPaymentUseCase } from "@/src/modules/tenders/application/use-cases/register-payment.use-case";
import { ListPaymentUseCase } from "@/src/modules/tenders/application/use-cases/list-payment.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

const registerPaymentSchema = z.object({
    amount: z.coerce.number().positive("Amount must be a positive number"),
    observation: z.string().trim().optional()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();
        const data = registerPaymentSchema.parse(body);

        const repository = new PrismaTenderRepository();
        const useCase = new RegisterPaymentUseCase(repository);

        const payment = await useCase.execute({
            id: crypto.randomUUID(),
            tenderId: id,
            createdById: session.userId,
            amount: data.amount,
            paidAt: new Date(),
            observation: data.observation ?? null,
        });

        return NextResponse.json(payment, { status: 201 });
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

        if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
            return NextResponse.json({ message: "Tender not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaTenderRepository();
        const useCase = new ListPaymentUseCase(repository);
        const payments = await useCase.execute({ tenderId: id });

        return NextResponse.json(payments, { status: 200 });
    } catch (error) {
    if (error instanceof z.ZodError) {
    return NextResponse.json({ issues: error.issues }, { status: 422 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
        return NextResponse.json({ message: "Tender not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}