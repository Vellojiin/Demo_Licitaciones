"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { registerTenderPayment } from "@/src/modules/dashboard/infrastructure/dashboard.service";
import type { DashboardTender } from "@/src/modules/dashboard/infrastructure/dashboard.service";
import { getTenderDetail, type TenderDetail } from "@/src/modules/tenders/infrastructure/tender.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface PaymentModalProps {
  tender: DashboardTender;
  onClose: () => void;
  onPaid: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function PaymentModal({ tender, onClose, onPaid }: PaymentModalProps) {
  const [detail, setDetail] = useState<TenderDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [observation, setObservation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDetail = async () => {
      try {
        const data = await getTenderDetail(tender.id);
        if (!mounted) {
          return;
        }
        setDetail(data);
        setAmount(data.totals.pendingBalance.toString());
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

  const owed = detail?.totals.pendingBalance ?? 0;
  const paymentAmount = Number(amount);
  const isValidAmount = Number.isFinite(paymentAmount) && paymentAmount > 0;
  const exceedsOwed = isValidAmount && paymentAmount > owed;
  const remaining = isValidAmount && !exceedsOwed ? owed - paymentAmount : owed;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidAmount) {
      toast.error("Ingresa un monto de pago valido mayor a cero");
      return;
    }

    if (exceedsOwed) {
      toast.error("El monto del pago no puede superar el adeudado");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerTenderPayment({
        tenderId: tender.id,
        amount: paymentAmount,
        observation: observation || undefined,
      });
      toast.success("Pago registrado correctamente");
      onPaid();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Registrar Pago" onClose={onClose}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando saldo...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Adeudado</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(owed)}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="payment-amount" className={labelClassName}>
              Monto del pago
            </label>
            <div className="relative mt-2">
              <DollarSign
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="number"
                id="payment-amount"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={isSubmitting}
                className={`${inputClassName} pl-10`}
              />
            </div>
            {exceedsOwed ? (
              <p className="mt-1 text-xs text-red-600">
                El monto no puede superar el adeudado ({formatCurrency(owed)})
              </p>
            ) : isValidAmount ? (
              <p className="mt-1 text-xs text-gray-600">
                Restante:{" "}
                <span className="font-medium text-gray-900">
                  {formatCurrency(remaining)}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="payment-observation" className={labelClassName}>
              Observacion (opcional)
            </label>
            <input
              type="text"
              id="payment-observation"
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Nota del pago"
              disabled={isSubmitting}
              className={`${inputClassName} mt-2`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValidAmount || exceedsOwed}
              className="flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isSubmitting ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}