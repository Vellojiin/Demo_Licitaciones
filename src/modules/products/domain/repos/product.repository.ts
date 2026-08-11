import { Product } from "../entities/product.entity";

export interface ProductRepository {
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    create(product: Product): Promise<Product>;
    update(id: string, input: Partial<Pick<Product, "name" | "description" | "basePrice" | "updatedById" | "updatedAt">>): Promise<Product | null>;
    delete(id: string): Promise<boolean>;
}