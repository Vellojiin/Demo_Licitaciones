import { TenderRepository } from "../../domain/repos/tender.repository";

interface FinishTenderInput {
    tenderId: string;
}

export class FinishTenderUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: FinishTenderInput): Promise<void> {
        await this.tenderRepository.finish(input.tenderId);
    }
}