import { Client } from "@/src/modules/clients/domain/entities/client.entity";

export interface ClientRepository {
    create(client: Client): Promise<Client>;

    findAll(): Promise<Client[]>

    findById(id: string): Promise<Client | null>
    update(id: string, input: Partial<Pick<Client, "companyName" | "contactName" | "email" | "updatedById" | "updatedAt">>): Promise<Client | null>
    delete(id: string): Promise<boolean>
}