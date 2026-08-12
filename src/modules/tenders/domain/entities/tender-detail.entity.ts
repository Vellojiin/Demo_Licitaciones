import { Tender } from "./tender.entity";

export interface TenderDetailClient {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string;
}

export interface TenderDetailProduct {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface TenderDetailPayment {
    id: string;
    amount: number;
    paidAt: Date;
    observation: string | null;
    createdById: string;
    createdByName: string;
}

export interface TenderDetailTransition {
    id: string;
    previousStatus: Tender["status"] | null;
    newStatus: Tender["status"];
    createdAt: Date;
    userId: string;
    userName: string;
}

export interface TenderDetailTotals {
    productsAmount: number;
    paidAmount: number;
    pendingBalance: number;
}

export interface TenderDetail {
    tender: Tender;
    client: TenderDetailClient;
    products: TenderDetailProduct[];
    payments: TenderDetailPayment[];
    history: TenderDetailTransition[];
    totals: TenderDetailTotals;
}

export interface TenderHistoryItem {
    id: string;
    previousStatus: Tender["status"] | null;
    newStatus: Tender["status"];
    createdAt: Date;
    userId: string;
    userName: string;
}
