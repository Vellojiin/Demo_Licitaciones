import { sendTenderReminderEmail } from "@/src/infrastructure/resend/resend";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

interface ProcessTenderJobsInput {
    systemUserId: string;
    reminderWindowHours?: number;
    now?: Date;
}

export interface ProcessTenderJobsResult {
    overdueTendersMarkedAsLost: number;
    reminderEmailsSent: number;
}

export class ProcessTenderJobsUseCase {
    constructor(private readonly tenderRepository: TenderRepository) {}

    async execute(input: ProcessTenderJobsInput): Promise<ProcessTenderJobsResult> {
        const now = input.now ?? new Date();
        const reminderWindowHours = input.reminderWindowHours ?? 48;

        const overdueTenderIds = await this.tenderRepository.findOverdueActiveTenderIds(now);
        for (const tenderId of overdueTenderIds) {
            await this.tenderRepository.lose(tenderId, input.systemUserId);
        }

        const reminderTenderIds = await this.tenderRepository.findUpcomingReminderTenderIds(now, reminderWindowHours);
        let reminderEmailsSent = 0;

        for (const tenderId of reminderTenderIds) {
            const emailData = await this.tenderRepository.findActivationEmailData(tenderId);
            if (!emailData) {
                continue;
            }

            await sendTenderReminderEmail(emailData);
            await this.tenderRepository.markReminderSent(tenderId, now, input.systemUserId);
            reminderEmailsSent += 1;
        }

        return {
            overdueTendersMarkedAsLost: overdueTenderIds.length,
            reminderEmailsSent,
        };
    }
}
