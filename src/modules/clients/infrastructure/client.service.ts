import { ApiCall } from "@/src/shared/utils/api-client";

export interface ClientListItem {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  companyName: string;
  contactName?: string;
  email: string;
}

export async function listClients(): Promise<ClientListItem[]> {
  return ApiCall<ClientListItem[]>("/api/clients", {
    method: "GET",
    credentials: "include",
  });
}

export async function createClient(input: CreateClientInput): Promise<ClientListItem> {
  return ApiCall<ClientListItem>("/api/clients", {
    method: "POST",
    credentials: "include",
    body: {
      companyName: input.companyName,
      contactName: input.contactName?.trim() || undefined,
      email: input.email,
    },
  });
}