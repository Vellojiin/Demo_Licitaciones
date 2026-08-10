import { Prisma } from "@prisma/client";

import { prisma } from "@/src/infrastructure/prisma/prisma";
import { Tender } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";
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

    async addProduct(
        tenderId: string,
        productId: string,
        quantity: number,
        unitPrice: number
    ): Promise<TenderProduct> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error("TENDER_NOT_FOUND");
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const existingProduct = await prisma.tenderProduct.findUnique({
            where: {
                tenderId_productId: {
                    tenderId,
                    productId,
                },
            },
        });

        if (existingProduct) {
            const updated = await prisma.tenderProduct.update({
                where: {
                    tenderId_productId: {
                        tenderId,
                        productId,
                    },
                },
                data: {
                    quantity,
                    unitPrice: new Prisma.Decimal(unitPrice),
                },
            });

            return {
                id: updated.id,
                tenderId: updated.tenderId,
                productId: updated.productId,
                quantity: updated.quantity,
                unitPrice: Number(updated.unitPrice),
            };
        }

        const created = await prisma.tenderProduct.create({
            data: {
                tenderId,
                productId,
                quantity,
                unitPrice: new Prisma.Decimal(unitPrice),
            },
        });

        return {
            id: created.id,
            tenderId: created.tenderId,
            productId: created.productId,
            quantity: created.quantity,
            unitPrice: Number(created.unitPrice),
        };
    }

    async removeProduct(tenderId: string, productId: string): Promise<void> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error("TENDER_NOT_FOUND");
        }
        await prisma.tenderProduct.deleteMany({
            where: {
                    tenderId,
                    productId,
            },
        });
    }
}