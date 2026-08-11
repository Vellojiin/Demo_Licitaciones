import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

export class ListTenderUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(): Promise<Tender[]> {
        return this.tenderRepository.findAll();
    }
}