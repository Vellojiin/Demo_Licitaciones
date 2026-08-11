import { Tender, TenderActivationEmailData } from "@/src/modules/tenders/domain/entities/tender.entity";
import { Payment } from "@/src/modules/tenders/domain/entities/payment.entity";
import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";
import { TenderDetail, TenderHistoryItem } from "@/src/modules/tenders/domain/entities/tender-detail.entity";

export interface TenderRepository {
    create(tender: Tender): Promise<Tender>;
    findAll(): Promise<Tender[]>;
    findById(id: string): Promise<Tender | null>;
    findDetailById(id: string): Promise<TenderDetail | null>;
    findHistoryByTenderId(tenderId: string): Promise<TenderHistoryItem[]>;
    findActivationEmailData(tenderId: string): Promise<TenderActivationEmailData | null>;
    findOverdueActiveTenderIds(referenceDate: Date): Promise<string[]>;
    findUpcomingReminderTenderIds(referenceDate: Date, reminderWindowHours: number): Promise<string[]>;
    markReminderSent(tenderId: string, reminderSentAt: Date, userId: string): Promise<void>;

    addProduct(
        tenderId: string,
        productId: string,
        quantity: number,
        unitPrice: number
    ): Promise<TenderProduct>;

    updateProposalDocumentUrl(tenderId: string, proposalDocumentUrl: string, userId: string): Promise<Tender | null>;

    removeProduct(tenderId: string, productId: string): Promise<void>;
    findProductsByTenderId(tenderId: string): Promise<TenderProduct[]>;
    send(tenderId: string, userId: string): Promise<void>;

    registerPayment(payment: Payment): Promise<Payment>;
    findPaymentsByTenderId(tenderId: string): Promise<Payment[]>;

    finish(tenderId: string, userId: string): Promise<void>;
    markAsPorCobrar(tenderId: string, userId: string): Promise<void>;
    lose(tenderId: string, userId: string): Promise<void>;
}