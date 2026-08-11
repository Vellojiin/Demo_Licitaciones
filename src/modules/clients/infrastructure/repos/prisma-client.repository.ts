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

    async update(
        id: string,
        input: Partial<Pick<Client, "companyName" | "contactName" | "email" | "updatedById" | "updatedAt">>
    ): Promise<Client | null> {
        const existingClient = await prisma.client.findUnique({
            where: { id },
        });

        if (!existingClient) {
            return null;
        }

        return prisma.client.update({
            where: { id },
            data: {
                companyName: input.companyName,
                contactName: input.contactName,
                email: input.email,
                updatedById: input.updatedById,
                updatedAt: input.updatedAt,
            },
        });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await prisma.client.deleteMany({
            where: { id },
        });

        return deleted.count > 0;
    }
}