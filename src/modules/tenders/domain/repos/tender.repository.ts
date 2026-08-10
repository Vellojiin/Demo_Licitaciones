import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";

export interface TenderRepository {
    create(tender: Tender): Promise<Tender>;
    findAll(): Promise<Tender[]>;
    findById(id: string): Promise<Tender | null>;
}