import { Product } from "@/src/modules/products/domain/entities/product.entity";
import { ProductRepository } from "@/src/modules/products/domain/repos/product.repository";

interface CreateProductInput{
    name: string;
    description?: string;
    basePrice: number;
    userId: string;
}

export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository) {}

    async execute(input: CreateProductInput): Promise<Product> {
        const product: Product = {
            id: crypto.randomUUID(),
            name: input.name,
            description: input.description ?? null,
            basePrice: input.basePrice,
            createdById: input.userId,
            updatedById: input.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.productRepository.create(product);
    }
}