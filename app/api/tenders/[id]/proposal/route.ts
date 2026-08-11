import { NextResponse } from "next/server";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { UploadProposalUseCase } from "@/src/modules/tenders/application/use-cases/upload-proposal.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";
import { uploadTenderProposalFile } from "@/src/infrastructure/storage/supabase";


export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ message: "file is required" }, { status: 400 });
        }

        const proposalDocumentUrl = await uploadTenderProposalFile(file, id);
        const repository = new PrismaTenderRepository();
        const useCase = new UploadProposalUseCase(repository);
        const tender = await useCase.execute({
            tenderId: id,
            proposalDocumentUrl,
            userId: session.userId,
        });

        if (!tender) {
            return NextResponse.json({ message: "Tender not found" }, { status: 404 });
        }

        return NextResponse.json({ proposalDocumentUrl }, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
            return NextResponse.json({ message: "Tender not found" }, { status: 404 });
        }

        if (error instanceof Error && error.message === "UNABLE_TO_RESOLVE_PUBLIC_URL") {
            return NextResponse.json({ message: "Unable to resolve public URL for uploaded file" }, { status: 500 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
