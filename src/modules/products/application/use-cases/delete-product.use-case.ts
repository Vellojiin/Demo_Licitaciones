import { ProductRepository } from "@/src/modules/products/domain/repos/product.repository";

interface DeleteProductInput {
    id: string;
}

export class DeleteProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: DeleteProductInput): Promise<boolean> {
        return this.productRepository.delete(input.id);
    }
}
