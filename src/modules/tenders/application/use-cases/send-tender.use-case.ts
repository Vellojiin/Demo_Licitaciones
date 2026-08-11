import { TenderRepository } from "../../domain/repos/tender.repository";

interface SendTenderInput {
  tenderId: string;
  userId: string;
}

export class SendTenderUseCase {
  constructor(private readonly tenderRepository: TenderRepository) {}

  async execute(input: SendTenderInput): Promise<void> {
    await this.tenderRepository.send(input.tenderId, input.userId);
  }
}
