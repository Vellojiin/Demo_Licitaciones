"use client";

import { useEffect, useState } from "react";
import { Banknote, Calendar, LinkIcon, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { getTenderDetail, type TenderDetail } from "@/src/modules/tenders/infrastructure/tender.service";
import type { DashboardTender } from "@/src/modules/dashboard/infrastructure/dashboard.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface TenderDetailModalProps {
  tender: DashboardTender;
  onClose: () => void;
  onRegisterPayment?: (tender: DashboardTender) => void;
}

const statusBadgeStyles: Record<string, string> = {
  ACTIVA: "border-green-200 bg-green-50 text-green-700",
  BORRADOR: "border-gray-200 bg-gray-50 text-gray-500",
  COBRADA: "border-green-200 bg-green-50 text-green-700",
  FINALIZADA: "border-blue-200 bg-blue-50 text-blue-700",
  PERDIDA: "border-red-200 bg-red-50 text-red-600",
  POR_COBRAR: "border-amber-200 bg-amber-50 text-amber-600",
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TenderDetailModal({
  tender,
  onClose,
  onRegisterPayment,
}: TenderDetailModalProps) {
  const [detail, setDetail] = useState<TenderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDetail = async () => {
      try {
        const data = await getTenderDetail(tender.id);
        if (mounted) {
          setDetail(data);
        }
      } catch (error) {
        if (mounted) {
          const message =
            error instanceof Error ? error.message : "Ocurrió un error inesperado";
          toast.error(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [tender.id]);

  return (
    <Modal title="Detalle de Licitación" onClose={onClose} className="max-w-2xl">
      {isLoading || !detail ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando detalle...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {detail.tender.title}
              </h3>
              <span
                className={`inline-flex rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.5px] ${statusBadgeStyles[detail.tender.status] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}
              >
                {formatStatus(detail.tender.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{detail.tender.description}</p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
                Cliente
              </p>
              <p className="text-sm font-medium text-gray-900">
                {detail.client.companyName}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                <Phone size={12} className="text-gray-400" />
                {detail.client.contactName ?? "Sin contacto"}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-gray-600">
                <Mail size={12} className="text-gray-400" />
                {detail.client.email}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
                Valores
              </p>
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <Banknote size={14} className="text-gray-400" />
                Presupuesto: {formatCurrency(detail.tender.maxBudget)}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                Fecha final: {formatDate(detail.tender.deadline)}
              </p>
              {detail.tender.proposalDocumentUrl && (
                <a
                  href={detail.tender.proposalDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <LinkIcon size={12} />
                  Ver documento de propuesta
                </a>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
              Productos
            </p>
            {detail.products.length > 0 ? (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {detail.products.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Esta licitacion no tiene productos cargados.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(detail.totals.productsAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pagado</p>
                <p className="text-sm font-semibold text-green-700">
                  {formatCurrency(detail.totals.paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Adeudado</p>
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(detail.totals.pendingBalance)}
                </p>
              </div>
            </div>
          </section>

          {detail.payments.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
                Pagos registrados
              </p>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {detail.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDateTime(payment.paidAt)} · {payment.createdByName}
                        {payment.observation && ` · ${payment.observation}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail.history.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
                Historial de estados
              </p>
              <ol className="space-y-2 border-l border-gray-200 pl-4">
                {detail.history.map((item) => (
                  <li key={item.id} className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">
                      {item.previousStatus
                        ? `${formatStatus(item.previousStatus)} → ${formatStatus(item.newStatus)}`
                        : formatStatus(item.newStatus)}
                    </span>{" "}
                    · {formatDateTime(item.createdAt)} · {item.userName}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            {detail.tender.status === "POR_COBRAR" && onRegisterPayment && (
              <button
                type="button"
                onClick={() => onRegisterPayment(tender)}
                className="rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700"
              >
                Registrar Pago
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}