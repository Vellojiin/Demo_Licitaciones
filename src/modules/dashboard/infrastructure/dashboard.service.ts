import type { TenderStatus } from "@/src/modules/tenders/domain/entities/tender.entity";
import { ApiCall } from "@/src/shared/utils/api-client";

export interface DashboardTender {
  id: string;
  title: string;
  status: TenderStatus;
  maxBudget: number;
  deadline: string;
  clientName: string;
  productsAmount: number;
  paidAmount: number;
}

interface RegisterPaymentInput {
  tenderId: string;
  amount: number;
  observation?: string;
}

export async function listDashboardTenders(): Promise<DashboardTender[]> {
  return ApiCall<DashboardTender[]>("/api/tenders", {
    method: "GET",
    credentials: "include",
  });
}

export async function finishTender(tenderId: string): Promise<void> {
  await ApiCall<{ message: string }>(`/api/tenders/${tenderId}/finish`, {
    method: "PATCH",
    credentials: "include",
  });
}

export async function loseTender(tenderId: string): Promise<void> {
  await ApiCall<{ message: string }>(`/api/tenders/${tenderId}/lose`, {
    method: "PATCH",
    credentials: "include",
  });
}

export async function registerTenderPayment({
  tenderId,
  amount,
  observation,
}: RegisterPaymentInput): Promise<void> {
  await ApiCall<{ message: string }>(`/api/tenders/${tenderId}/payments`, {
    method: "POST",
    credentials: "include",
    body: {
      amount,
      observation,
    },
  });
}

export async function tenderToCollect(tenderId: string): Promise<void> {
  await ApiCall<{ message: string }>(`/api/tenders/${tenderId}/to-collect`, {
    method: "PATCH",
    credentials: "include",
  });
}