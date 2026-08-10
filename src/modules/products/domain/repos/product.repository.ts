import { Product } from "../entities/product.entity";

export interface ProductRepository {
    findAll(): Promise<Product[]>;
    create(product: Product): Promise<Product>;
}