export interface Client {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
}