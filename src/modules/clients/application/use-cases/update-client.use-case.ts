import { Client } from "@/src/modules/clients/domain/entities/client.entity";
import { ClientRepository } from "@/src/modules/clients/domain/repos/client.repository";

interface UpdateClientInput {
    id: string;
    companyName?: string;
    contactName?: string | null;
    email?: string;
    userId: string;
}

export class UpdateClientUseCase {
    constructor(private readonly clientRepository: ClientRepository) {}

    async execute(input: UpdateClientInput): Promise<Client | null> {
        return this.clientRepository.update(input.id, {
            companyName: input.companyName,
            contactName: input.contactName,
            email: input.email,
            updatedById: input.userId,
            updatedAt: new Date(),
        });
    }
}
