import { NextResponse } from "next/server";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { SendTenderUseCase } from "@/src/modules/tenders/application/use-cases/send-tender.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const repository = new PrismaTenderRepository();
    const useCase = new SendTenderUseCase(repository);

    await useCase.execute({ tenderId: id, userId: session.userId });

    return NextResponse.json({ message: "Tender sent successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
      return NextResponse.json({ message: "Tender not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "PROPOSAL_DOCUMENT_REQUIRED") {
      return NextResponse.json({ message: "Proposal document is required before sending the tender" }, { status: 422 });
    }

    if (error instanceof Error && error.message === "INVALID_TENDER_STATUS_TRANSITION") {
      return NextResponse.json({ message: "Invalid tender status transition" }, { status: 409 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
