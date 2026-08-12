export type TenderStatus = "BORRADOR" | "ACTIVA" | "FINALIZADA" | "POR_COBRAR" | "COBRADA" | "PERDIDA";

export interface Tender {
    id: string;
    title: string;
    description: string | null;
    status: TenderStatus;
    maxBudget: number;
    deadline: Date;
    proposalDocumentUrl: string | null;
    reminderSentAt: Date | null;
    clientId: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TenderListItem {
    id: string;
    title: string;
    status: TenderStatus;
    maxBudget: number;
    deadline: Date;
    clientName: string;
    productsAmount: number;
    paidAmount: number;
}

export interface TenderActivationProduct {
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface TenderActivationClient {
    companyName: string;
    email: string;
}

export interface TenderActivationEmailData {
    tender: Tender;
    client: TenderActivationClient;
    products: TenderActivationProduct[];
}