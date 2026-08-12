import { ApiCall } from "@/src/shared/utils/api-client";

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
}

export async function createProduct(input: CreateProductInput): Promise<ProductListItem> {
  return ApiCall<ProductListItem>("/api/products", {
    method: "POST",
    credentials: "include",
    body: {
      name: input.name,
      description: input.description?.trim() || undefined,
      basePrice: input.basePrice,
    },
  });
}

export async function listProducts(): Promise<ProductListItem[]> {
  return ApiCall<ProductListItem[]>("/api/products", {
    method: "GET",
    credentials: "include",
  });
}