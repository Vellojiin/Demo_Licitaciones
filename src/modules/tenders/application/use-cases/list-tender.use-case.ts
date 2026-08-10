import { Tender } from "../../domain/entities/tender.entity";
import { TenderRepository } from "../../domain/repos/tender.repository";

export class ListTenderUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(): Promise<Tender[]> {
        return this.tenderRepository.findAll();
    }
}