import { Prisma } from "@prisma/client";

import { prisma } from "@/src/infrastructure/prisma/prisma";
import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

export class PrismaTenderRepository implements TenderRepository {
    async create(tender: Tender): Promise<Tender> {
        const createdTender = await prisma.tender.create({
            data: {
                id: tender.id,
                title: tender.title,
                description: tender.description,
                status: tender.status,
                maxBudget: new Prisma.Decimal(tender.maxBudget),
                deadline: tender.deadline,
                proposalDocumentUrl: tender.proposalDocumentUrl,
                clientId: tender.clientId,
                createdById: tender.createdById,
                updatedById: tender.updatedById,
                createdAt: tender.createdAt,
                updatedAt: tender.updatedAt,
            },
        });

        return {
            ...createdTender, maxBudget: Number(createdTender.maxBudget)
        }
    }

    async findAll(): Promise<Tender[]> {
        const tenders = await prisma.tender.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return tenders.map(tender => ({
            ...tender,
            maxBudget: Number(tender.maxBudget),
        }));
    }

    async findById(id: string): Promise<Tender | null> {
        const tender = await prisma.tender.findUnique({
            where: { id },
        });

        if (!tender) {
            return null;
        }

        return {
            ...tender,
            maxBudget: Number(tender.maxBudget),
        };
    }
}