import { Product } from "@/src/modules/products/domain/entities/product.entity";
import { ProductRepository } from "@/src/modules/products/domain/repos/product.repository";

interface UpdateProductInput {
    id: string;
    name?: string;
    description?: string | null;
    basePrice?: number;
    userId: string;
}

export class UpdateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: UpdateProductInput): Promise<Product | null> {
        return this.productRepository.update(input.id, {
            name: input.name,
            description: input.description,
            basePrice: input.basePrice,
            updatedById: input.userId,
            updatedAt: new Date(),
        });
    }
}
