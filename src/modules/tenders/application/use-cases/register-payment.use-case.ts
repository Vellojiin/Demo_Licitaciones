import { Payment } from "@/src/modules/tenders/domain/entities/payment.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

export class RegisterPaymentUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: Payment): Promise<Payment> {
        if (input.amount <= 0) {
            throw new Error("Amount must be greater than zero");
        }

        const payment: Payment = {
            id: crypto.randomUUID(),
            tenderId: input.tenderId,
            createdById: input.createdById,
            amount: input.amount,
            paidAt: new Date(),
            observation: input.observation?.trim() || null
        };

        return this.tenderRepository.registerPayment(payment);
    }
}