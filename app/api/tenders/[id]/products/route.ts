import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { AddProductUseCase } from "@/src/modules/tenders/application/use-cases/add-product.use-case";
import { RemoveProductUseCase } from "@/src/modules/tenders/application/use-cases/remove-product.use-case";
import { ListTenderProductsUseCase } from "@/src/modules/tenders/application/use-cases/list-tender-products.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";

export const dynamic = "force-dynamic";

const addProductSchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  quantity: z.coerce.number().int().positive("quantity must be positive"),
  unitPrice: z.coerce.number().positive("unitPrice must be positive"),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const repository = new PrismaTenderRepository();
    const useCase = new ListTenderProductsUseCase(repository);

    const products = await useCase.execute({
      tenderId: id,
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
      return NextResponse.json({ message: "Tender not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = addProductSchema.parse(body);

    const repository = new PrismaTenderRepository();
    const useCase = new AddProductUseCase(repository);

    const tenderProduct = await useCase.execute({
      tenderId: id,
      productId: data.productId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    });

    return NextResponse.json(tenderProduct, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 422 });
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
      return NextResponse.json({ message: "Tender not found" }, { status: 404 });
    }

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "productId is required" }, { status: 400 });
    }

    const repository = new PrismaTenderRepository();
    const useCase = new RemoveProductUseCase(repository);

    await useCase.execute({
      tenderId: id,
      productId,
    });

    return NextResponse.json({ message: "Product removed from tender" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "TENDER_NOT_FOUND") {
      return NextResponse.json({ message: "Tender not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}