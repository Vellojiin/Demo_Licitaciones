import { Prisma} from "@prisma/client";
import { Product } from "../../domain/entities/product.entity";
import { ProductRepository } from "../../domain/repos/product.repository";
import { prisma } from "@/src/infrastructure/prisma/prisma";

export class PrismaProductRepository implements ProductRepository {
    async create(product: Product): Promise<Product> {
        const createdProduct = await prisma.product.create({
            data:{
                id: product.id,
                name: product.name,
                description: product.description,
                basePrice: new Prisma.Decimal(product.basePrice),
                createdById: product.createdById,
                updatedById: product.updatedById,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            }
        });
        return { ...createdProduct, basePrice: createdProduct.basePrice.toNumber() };
    }

    async findAll(): Promise<Product[]> {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return products.map(product => ({
            ...product,
            basePrice: product.basePrice.toNumber(),
        }));
    }

    async findById(id: string): Promise<Product | null> {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return null;
        }

        return {
            ...product,
            basePrice: product.basePrice.toNumber(),
        };
    }

    async update(
        id: string,
        input: Partial<Pick<Product, "name" | "description" | "basePrice" | "updatedById" | "updatedAt">>
    ): Promise<Product | null> {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return null;
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                name: input.name,
                description: input.description,
                basePrice:
                    typeof input.basePrice === "number"
                        ? new Prisma.Decimal(input.basePrice)
                        : undefined,
                updatedById: input.updatedById,
                updatedAt: input.updatedAt,
            },
        });

        return {
            ...updated,
            basePrice: updated.basePrice.toNumber(),
        };
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await prisma.product.deleteMany({
            where: { id },
        });

        return deleted.count > 0;
    }
}