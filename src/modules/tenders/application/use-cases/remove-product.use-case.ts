import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface RemoveProductInput {
    tenderId: string;
    productId: string;
}

export class RemoveProductUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: RemoveProductInput): Promise<void> {
        await this.tenderRepository.removeProduct(input.tenderId, input.productId);
    }
}