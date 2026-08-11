import { ClientRepository } from "@/src/modules/clients/domain/repos/client.repository";

interface DeleteClientInput {
    id: string;
}

export class DeleteClientUseCase {
    constructor(private readonly clientRepository: ClientRepository) {}

    async execute(input: DeleteClientInput): Promise<boolean> {
        return this.clientRepository.delete(input.id);
    }
}
