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
}