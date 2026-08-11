import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface UploadProposalInput {
    tenderId: string;
    proposalDocumentUrl: string;
    userId: string;
}

export class UploadProposalUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: UploadProposalInput): Promise<Tender | null> {
        return this.tenderRepository.updateProposalDocumentUrl(
            input.tenderId,
            input.proposalDocumentUrl,
            input.userId
        );
    }
}
