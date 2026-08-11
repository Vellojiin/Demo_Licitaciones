import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { DeleteProductUseCase } from "@/src/modules/products/application/use-cases/delete-product.use-case";
import { UpdateProductUseCase } from "@/src/modules/products/application/use-cases/update-product.use-case";
import { PrismaProductRepository } from "@/src/modules/products/infrastructure/repos/prisma-product.repository";

export const dynamic = "force-dynamic";

const updateProductSchema = z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    description: z.string().trim().optional().nullable(),
    basePrice: z.coerce.number().min(0, "Base price must be a positive number").optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaProductRepository();
        const product = await repository.findById(id);

        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        const { id } = await params;
        const body = await request.json();
        const data = updateProductSchema.parse(body);

        const repository = new PrismaProductRepository();
        const useCase = new UpdateProductUseCase(repository);
        const updatedProduct = await useCase.execute({
            id,
            name: data.name,
            description: data.description,
            basePrice: data.basePrice,
            userId: session.userId,
        });

        if (!updatedProduct) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ issues: error.issues }, { status: 422 });
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
        }

        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth();
        const { id } = await params;

        const repository = new PrismaProductRepository();
        const useCase = new DeleteProductUseCase(repository);
        const deleted = await useCase.execute({ id });

        if (!deleted) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
