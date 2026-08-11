import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface FinishTenderInput {
    tenderId: string;
    userId: string;
}

export class FinishTenderUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: FinishTenderInput): Promise<void> {
        await this.tenderRepository.finish(input.tenderId, input.userId);
    }
}