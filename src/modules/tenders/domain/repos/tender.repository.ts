import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
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

    removeProduct(tenderId: string, productId: string): Promise<void>;
    findProductsByTenderId(tenderId: string): Promise<TenderProduct[]>;
    send(tenderId: string): Promise<void>;
}