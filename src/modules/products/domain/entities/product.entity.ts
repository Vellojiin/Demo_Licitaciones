export interface Product {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    createdById: string;
    updatedById: string;
    createdAt: Date;
    updatedAt: Date;
}