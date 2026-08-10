export type TenderStatus = "BORRADOR" | "ACTIVA" | "FINALIZADA" | "POR_COBRAR" | "COBRADA" | "PERDIDA";

export interface Tender {
    id: string;
    title: string;
    description: string | null;
    status: TenderStatus;
    maxBudget: number;
    deadline: Date;
    proposalDocumentUrl: string | null;
    clientId: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
}