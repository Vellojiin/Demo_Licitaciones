import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface CreateTenderInput {
    title: string;
    description?: string;
    maxBudget: number;
    deadline: Date;
    clientId: string;
    userId: string;
}

export class CreateTenderUseCase{
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: CreateTenderInput): Promise<Tender> {
        const tender: Tender = {
            id: crypto.randomUUID(),
            title: input.title,
            description: input.description ?? null,
            status: "BORRADOR",
            maxBudget: input.maxBudget,
            deadline: input.deadline,
            proposalDocumentUrl: null,
            clientId: input.clientId,
            createdById: input.userId,
            updatedById: input.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.tenderRepository.create(tender);
    }
}