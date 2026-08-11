import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { PrismaProductRepository } from "@/src/modules/products/infrastructure/repos/prisma-product.repository";
import { CreateProductUseCase } from "@/src/modules/products/application/use-cases/create-product.use-case";
import { ListProductUseCase } from "@/src/modules/products/application/use-cases/list-product.use-case";

export const dynamic = "force-dynamic";

const createdProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0, "Base price must be a positive number"),
});

export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const data = createdProductSchema.parse(body);

        const repository = new PrismaProductRepository();
        const useCase = new CreateProductUseCase(repository);

        const product = await useCase.execute({
            name: data.name,
            description: data.description,
            basePrice: data.basePrice,
            userId: session.userId,
        });
        return NextResponse.json(product, { status: 201 });
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

export async function GET() {
    try {
        await requireAuth();

        const repository = new PrismaProductRepository();
        const useCase = new ListProductUseCase(repository);
        const products = await useCase.execute();

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}