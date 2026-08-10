import { Product } from "../../domain/entities/product.entity";
import { ProductRepository } from "../../domain/repos/product.repository";

export class ListProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    async execute(): Promise<Product[]> {
        return this.productRepository.findAll();
    }
}