import { prisma } from "@/src/infrastructure/prisma/prisma";
import { Client } from "@/src/modules/clients/domain/entities/client.entity";
import { ClientRepository } from "@/src/modules/clients/domain/repos/client.repository";

export class PrismaClientRepository implements ClientRepository {
  async create(client: Client): Promise<Client> {
    const createdClient = await prisma.client.create({
      data: {
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email,
        createdById: client.createdById,
        updatedById: client.updatedById,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
    });

    return createdClient;
    }

    async findAll(): Promise<Client[]> {
        return prisma.client.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async findById(id: string): Promise<Client | null> {
        return prisma.client.findUnique({
            where: {
                id
            }
        })
    }
}