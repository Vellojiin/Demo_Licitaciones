import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";
import { sendTenderActivationEmail } from "@/src/infrastructure/resend/resend";

interface SendTenderInput {
  tenderId: string;
  userId: string;
}

export class SendTenderUseCase {
  constructor(private readonly tenderRepository: TenderRepository) {}

  async execute(input: SendTenderInput): Promise<void> {
    const activationEmailData = await this.tenderRepository.findActivationEmailData(input.tenderId);

    if (!activationEmailData) {
      throw new Error("TENDER_NOT_FOUND");
    }

    await this.tenderRepository.send(input.tenderId, input.userId);
    await sendTenderActivationEmail(activationEmailData);
  }
}
