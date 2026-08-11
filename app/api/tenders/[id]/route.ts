import { NextResponse } from "next/server";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { SendTenderUseCase } from "@/src/modules/tenders/application/use-cases/send-tender.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

export const dynamic = "force-dynamic";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const repository = new PrismaTenderRepository();
    const useCase = new SendTenderUseCase(repository);

    await useCase.execute({ tenderId: id });

    return NextResponse.json({ message: "Tender sent successfully" }, { status: 200 });
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
