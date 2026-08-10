import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface AddProductInput{
    tenderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
}

export class AddProductUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: AddProductInput): Promise<TenderProduct> {
        if (input.quantity <= 0) {
            throw new Error("Quantity must be greater than zero");
        }

        if (input.unitPrice <= 0) {
            throw new Error("Unit price must be greater than zero");
        }

        return this.tenderRepository.addProduct(
            input.tenderId,
            input.productId,
            input.quantity,
            input.unitPrice
        );
    }
}