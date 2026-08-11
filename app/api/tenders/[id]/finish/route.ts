import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { FinishTenderUseCase } from "@/src/modules/tenders/application/use-cases/finish-tender.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaTenderRepository();
        const useCase = new FinishTenderUseCase(repository);
        await useCase.execute({ tenderId: id });

        return NextResponse.json({ message: "Tender finished successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
            return NextResponse.json({ message: "Tender not found" }, { status: 404 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}