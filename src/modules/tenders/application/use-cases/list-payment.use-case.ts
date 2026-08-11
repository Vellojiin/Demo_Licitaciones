import { Payment } from "@/src/modules/tenders/domain/entities/payment.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface ListPaymentUseCaseInput {
    tenderId: string;
}

export class ListPaymentUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: ListPaymentUseCaseInput): Promise<Payment[]> {
        return this.tenderRepository.findPaymentsByTenderId(input.tenderId);
    }
}