import { Product } from "@/src/modules/products/domain/entities/product.entity";
import { ProductRepository } from "@/src/modules/products/domain/repos/product.repository";

export class ListProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    async execute(): Promise<Product[]> {
        return this.productRepository.findAll();
    }
}