import { Prisma } from "@prisma/client";

import { prisma } from "@/src/infrastructure/prisma/prisma";
import { Tender, TenderStatus, TenderActivationEmailData } from "@/src/modules/tenders/domain/entities/tender.entity";
import { TenderProduct } from "@/src/modules/tenders/domain/entities/tender-product.entity";
import { Payment } from "@/src/modules/tenders/domain/entities/payment.entity";
import { TenderRepository } from "@/src/modules/tenders/domain/repos/tender.repository";

const ALLOWED_TRANSITIONS: Record<TenderStatus, TenderStatus[]> = {
    BORRADOR: ["ACTIVA"],
    ACTIVA: ["FINALIZADA", "PERDIDA"],
    FINALIZADA: ["POR_COBRAR"],
    POR_COBRAR: ["COBRADA"],
    COBRADA: [],
    PERDIDA: [],
};

const NON_EDITABLE_PRODUCT_STATUSES: TenderStatus[] = ["FINALIZADA", "POR_COBRAR", "COBRADA", "PERDIDA"];

export class PrismaTenderRepository implements TenderRepository {
    private async transitionStatus(tenderId: string, userId: string, nextStatus: TenderStatus): Promise<void> {
        
        await prisma.$transaction(async (tx) => {
            const tender = await tx.tender.findUnique({
                where: { id: tenderId },
            });

            if (!tender) {
                throw new Error("TENDER_NOT_FOUND");
            }

            if (!ALLOWED_TRANSITIONS[tender.status].includes(nextStatus)) {
                throw new Error("INVALID_TENDER_STATUS_TRANSITION");
            }

            if (nextStatus === "ACTIVA" && !tender.proposalDocumentUrl) {
                throw new Error("PROPOSAL_DOCUMENT_REQUIRED");
            }

            await tx.tender.update({
                where: { id: tenderId },
                data: {
                    status: nextStatus,
                    updatedById: userId,
                },
            });

            await tx.tenderTransition.create({
                data: {
                    id: crypto.randomUUID(),
                    tenderId,
                    userId,
                    previousStatus: tender.status,
                    newStatus: nextStatus,
                },
            });
        });
    }

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

    async findActivationEmailData(tenderId: string): Promise<TenderActivationEmailData | null> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
            include: {
                client: true,
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!tender) {
            return null;
        }

        return {
            tender: {
                id: tender.id,
                title: tender.title,
                description: tender.description,
                status: tender.status,
                maxBudget: Number(tender.maxBudget),
                deadline: tender.deadline,
                proposalDocumentUrl: tender.proposalDocumentUrl,
                clientId: tender.clientId,
                createdById: tender.createdById,
                updatedById: tender.updatedById,
                createdAt: tender.createdAt,
                updatedAt: tender.updatedAt,
            },
            client: {
                companyName: tender.client.companyName,
                email: tender.client.email,
            },
            products: tender.products.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
            })),
        };
    }

    async addProduct(
        tenderId: string,
        productId: string,
        quantity: number,
        unitPrice: number
    ): Promise<TenderProduct> {
        return prisma.$transaction(async (tx) => {
            const tender = await tx.tender.findUnique({
                where: { id: tenderId },
            });

            if (!tender) {
                throw new Error("TENDER_NOT_FOUND");
            }

            if (NON_EDITABLE_PRODUCT_STATUSES.includes(tender.status)) {
                throw new Error("TENDER_PRODUCTS_NOT_EDITABLE");
            }

            const product = await tx.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            const existingProduct = await tx.tenderProduct.findUnique({
                where: {
                    tenderId_productId: {
                        tenderId,
                        productId,
                    },
                },
            });

            const tenderProducts = await tx.tenderProduct.findMany({
                where: { tenderId },
            });

            const currentTotal = tenderProducts.reduce(
                (acc, item) => acc.plus(item.unitPrice.mul(item.quantity)),
                new Prisma.Decimal(0)
            );

            const newLineTotal = new Prisma.Decimal(unitPrice).mul(quantity);
            const existingLineTotal = existingProduct
                ? existingProduct.unitPrice.mul(existingProduct.quantity)
                : new Prisma.Decimal(0);
            const nextTotal = currentTotal.minus(existingLineTotal).plus(newLineTotal);
            const maxBudget = new Prisma.Decimal(tender.maxBudget);

            if (nextTotal.gt(maxBudget)) {
                throw new Error("TENDER_MAX_BUDGET_EXCEEDED");
            }

            if (existingProduct) {
                const updated = await tx.tenderProduct.update({
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

            const created = await tx.tenderProduct.create({
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
        });
    }

    async updateProposalDocumentUrl(
        tenderId: string,
        proposalDocumentUrl: string,
        userId: string
    ): Promise<Tender | null> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            return null;
        }

        const updatedTender = await prisma.tender.update({
            where: { id: tenderId },
            data: {
                proposalDocumentUrl,
                updatedById: userId,
            },
        });

        return {
            ...updatedTender,
            maxBudget: Number(updatedTender.maxBudget),
        };
    }

    async removeProduct(tenderId: string, productId: string): Promise<void> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error("TENDER_NOT_FOUND");
        }

        if (NON_EDITABLE_PRODUCT_STATUSES.includes(tender.status)) {
            throw new Error("TENDER_PRODUCTS_NOT_EDITABLE");
        }

        await prisma.tenderProduct.deleteMany({
            where: {
                tenderId,
                productId,
            },
        });
    }

    async findProductsByTenderId(tenderId: string): Promise<TenderProduct[]> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error("TENDER_NOT_FOUND");
        }

        const tenderProducts = await prisma.tenderProduct.findMany({
            where: { tenderId },
            orderBy: {
                productId: "asc",
            },
        });

        return tenderProducts.map((item) => ({
            id: item.id,
            tenderId: item.tenderId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
        }));
    }

    async send(tenderId: string, userId: string): Promise<void> {
        await this.transitionStatus(tenderId, userId, "ACTIVA");
    }

    async registerPayment(payment: Payment): Promise<Payment> {
        return prisma.$transaction(async (tx) => {
            const tender = await tx.tender.findUnique({
                where: { id: payment.tenderId },
                include: {
                    products: true,
                },
            });

            if (!tender) {
                throw new Error("TENDER_NOT_FOUND");
            }

            if (tender.status !== "POR_COBRAR") {
                throw new Error("INVALID_PAYMENT_STATUS");
            }

            const totalFacturado = tender.products.reduce(
                (acc, item) => acc.plus(item.unitPrice.mul(item.quantity)),
                new Prisma.Decimal(0)
            );

            const paymentAggregate = await tx.payment.aggregate({
                where: { tenderId: payment.tenderId },
                _sum: { amount: true },
            });

            const totalPagado = paymentAggregate._sum.amount ?? new Prisma.Decimal(0);
            const saldoPendiente = totalFacturado.minus(totalPagado);
            const paymentAmount = new Prisma.Decimal(payment.amount);

            if (paymentAmount.gt(saldoPendiente)) {
                throw new Error("PAYMENT_EXCEEDS_PENDING_BALANCE");
            }

            const createdPayment = await tx.payment.create({
                data: {
                    id: payment.id,
                    tenderId: payment.tenderId,
                    createdById: payment.createdById,
                    amount: paymentAmount,
                    paidAt: payment.paidAt,
                    observation: payment.observation,
                },
            });

            const remainingBalance = saldoPendiente.minus(paymentAmount);
            if (remainingBalance.eq(0)) {
                await tx.tender.update({
                    where: { id: payment.tenderId },
                    data: {
                        status: "COBRADA",
                        updatedById: payment.createdById,
                    },
                });

                await tx.tenderTransition.create({
                    data: {
                        id: crypto.randomUUID(),
                        tenderId: payment.tenderId,
                        userId: payment.createdById,
                        previousStatus: "POR_COBRAR",
                        newStatus: "COBRADA",
                    },
                });
            }

            return {
                id: createdPayment.id,
                tenderId: createdPayment.tenderId,
                createdById: createdPayment.createdById,
                amount: Number(createdPayment.amount),
                paidAt: createdPayment.paidAt,
                observation: createdPayment.observation,
            };
        });
    }

    async findPaymentsByTenderId(tenderId: string): Promise<Payment[]> {
        const tender = await prisma.tender.findUnique({
            where: { id: tenderId },
        });

        if (!tender) {
            throw new Error("TENDER_NOT_FOUND");
        }

        const payments = await prisma.payment.findMany({
            where: { tenderId },
            orderBy: {
                paidAt: "desc",
            },
        });

        return payments.map((payment) => ({
            id: payment.id,
            tenderId: payment.tenderId,
            createdById: payment.createdById,
            amount: Number(payment.amount),
            paidAt: payment.paidAt,
            observation: payment.observation,
        }));
    }

    async finish(tenderId: string, userId: string): Promise<void> {
        await this.transitionStatus(tenderId, userId, "FINALIZADA");
    }

    async markAsPorCobrar(tenderId: string, userId: string): Promise<void> {
        await this.transitionStatus(tenderId, userId, "POR_COBRAR");
    }

    async lose(tenderId: string, userId: string): Promise<void> {
        await this.transitionStatus(tenderId, userId, "PERDIDA");
    }
}