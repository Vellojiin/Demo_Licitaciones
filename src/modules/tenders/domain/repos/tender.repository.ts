import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { Payment } from "@/src/modules/tenders/domain/entities/payment.entity";
import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";

export interface TenderRepository {
    create(tender: Tender): Promise<Tender>;
    findAll(): Promise<Tender[]>;
    findById(id: string): Promise<Tender | null>;

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