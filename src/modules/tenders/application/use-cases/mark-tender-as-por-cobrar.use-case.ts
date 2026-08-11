import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface MarkTenderAsPorCobrarInput {
    tenderId: string;
    userId: string;
}

export class MarkTenderAsPorCobrarUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: MarkTenderAsPorCobrarInput): Promise<void> {
        await this.tenderRepository.markAsPorCobrar(input.tenderId, input.userId);
    }
}
