import { NextResponse } from "next/server";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaTenderRepository();
        const history = await repository.findHistoryByTenderId(id);

        return NextResponse.json(history, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
            return NextResponse.json({ message: "Tender not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
