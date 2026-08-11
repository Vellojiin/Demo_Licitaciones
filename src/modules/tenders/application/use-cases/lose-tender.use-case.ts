import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface LoseTenderInput {
    tenderId: string;
    userId: string;
}

export class LoseTenderUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: LoseTenderInput): Promise<void> {
        await this.tenderRepository.lose(input.tenderId, input.userId);
    }
}