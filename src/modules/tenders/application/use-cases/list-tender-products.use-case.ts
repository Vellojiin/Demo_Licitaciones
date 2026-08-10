import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface ListTenderProductsInput {
  tenderId: string;
}

export class ListTenderProductsUseCase {
  constructor(private readonly tenderRepository: TenderRepository) {}

  async execute(input: ListTenderProductsInput): Promise<TenderProduct[]> {
    return this.tenderRepository.findProductsByTenderId(input.tenderId);
  }
}