import { Client } from "@/src/modules/clients/domain/entities/client.entity";

export interface ClientRepository {
    create(client: Client): Promise<Client>;

    findAll(): Promise<Client[]>

    findById(id: string): Promise<Client | null>
}