import { Client } from "@/src/modules/clients/domain/entities/client.entity";
import { ClientRepository } from "@/src/modules/clients/domain/repos/client.repository";

interface CreateClientInput {
    companyName: string;
    contactName?: string;
    email: string;
    userId: string
}

export class CreateClientUseCase{
    constructor(private readonly clientRepository: ClientRepository) {}

    async execute(input: CreateClientInput): Promise<Client> {
        const client: Client = {
            id: crypto.randomUUID(),
            companyName: input.companyName,
            contactName: input.contactName ?? null,
            email: input.email,
            createdById: input.userId,
            updatedById: input.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return this.clientRepository.create(client);
    }
}