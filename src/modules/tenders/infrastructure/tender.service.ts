import { ApiCall } from "@/src/shared/utils/api-client";

export interface TenderListItem {
  id: string;
  title: string;
  status: string;
  maxBudget: number;
  deadline: string;
  clientId: string;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenderDetail {
  tender: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    maxBudget: number;
    deadline: string;
    proposalDocumentUrl: string | null;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  };
  client: {
    id: string;
    companyName: string;
    contactName: string | null;
    email: string;
  };
  products: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  payments: {
    id: string;
    amount: number;
    paidAt: string;
    observation: string | null;
    createdById: string;
    createdByName: string;
  }[];
  history: {
    id: string;
    previousStatus: string | null;
    newStatus: string;
    createdAt: string;
    userId: string;
    userName: string;
  }[];
  totals: {
    productsAmount: number;
    paidAmount: number;
    pendingBalance: number;
  };
}

export interface CreateTenderInput {
  title: string;
  description?: string;
  maxBudget: number;
  deadline: string;
  clientId: string;
}

export async function createTender(input: CreateTenderInput): Promise<TenderListItem> {
  return ApiCall<TenderListItem>("/api/tenders", {
    method: "POST",
    credentials: "include",
    body: {
      title: input.title,
      description: input.description?.trim() || undefined,
      maxBudget: input.maxBudget,
      deadline: input.deadline,
      clientId: input.clientId,
    },
  });
}

export async function getTenderDetail(tenderId: string): Promise<TenderDetail> {
  return ApiCall<TenderDetail>(`/api/tenders/${tenderId}`, {
    method: "GET",
    credentials: "include",
  });
}

export async function sendTender(tenderId: string): Promise<void> {
  await ApiCall<{ message: string }>(`/api/tenders/${tenderId}`, {
    method: "PATCH",
    credentials: "include",
  });
}

export interface AddTenderProductInput {
  tenderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export async function addTenderProduct(input: AddTenderProductInput): Promise<void> {
  await ApiCall<{ id: string }>(`/api/tenders/${input.tenderId}/products`, {
    method: "POST",
    credentials: "include",
    body: {
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    },
  });
}

export async function removeTenderProduct(tenderId: string, productId: string): Promise<void> {
  await ApiCall<{ message: string }>(
    `/api/tenders/${tenderId}/products?productId=${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
}

export async function uploadProposalDocument(
  tenderId: string,
  file: File
): Promise<{ proposalDocumentUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/tenders/${tenderId}/proposal`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Error al subir el documento";
    throw new Error(message);
  }

  return response.json() as Promise<{ proposalDocumentUrl: string }>;
}