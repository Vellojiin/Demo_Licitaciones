export interface Payment {
    id: string;
    tenderId: string;
    createdById: string;
    amount: number;
    paidAt: Date;
    observation: string | null;
}