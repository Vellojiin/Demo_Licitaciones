import type { DashboardTender } from "@/src/modules/dashboard/infrastructure/dashboard.service";
import type { TenderStatus } from "@/src/modules/tenders/domain/entities/tender.entity";

interface TendersTableProps {
  tenders: DashboardTender[];
  pendingActionId: string | null;
  onFinishTender: (tender: DashboardTender) => void;
  onLoseTender: (tender: DashboardTender) => void;
  onRegisterPayment: (tender: DashboardTender) => void;
  onAddProposal: (tender: DashboardTender) => void;
  onOpenDetail: (tender: DashboardTender) => void;
}

interface StatusStyle {
  container: string;
  label: string;
}

const statusStyles: Record<TenderStatus, StatusStyle> = {
  ACTIVA: {
    container: "border border-green-200 bg-green-50",
    label: "text-green-700",
  },
  BORRADOR: {
    container: "border border-gray-200 bg-gray-50",
    label: "text-gray-500",
  },
  COBRADA: {
    container: "border border-green-200 bg-green-50",
    label: "text-green-700",
  },
  FINALIZADA: {
    container: "border border-blue-200 bg-blue-50",
    label: "text-blue-700",
  },
  PERDIDA: {
    container: "border border-red-200 bg-red-50",
    label: "text-red-600",
  },
  POR_COBRAR: {
    container: "border border-amber-200 bg-amber-50",
    label: "text-amber-600",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status: TenderStatus): string {
  return status.replaceAll("_", " ");
}

function StatusBadge({ status }: { status: TenderStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-[10px] font-medium uppercase tracking-[0.5px] ${style.container} ${style.label}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  );
}

function renderActions({
  tender,
  isPending,
  onFinishTender,
  onLoseTender,
  onRegisterPayment,
  onAddProposal,
}: {
  tender: DashboardTender;
  isPending: boolean;
  onFinishTender: (tender: DashboardTender) => void;
  onLoseTender: (tender: DashboardTender) => void;
  onRegisterPayment: (tender: DashboardTender) => void;
  onAddProposal: (tender: DashboardTender) => void;
}) {
  if (tender.status === "ACTIVA") {
    return (
      <div className="flex flex-wrap gap-2">
        <ActionButton
          label="✓ Ganada"
          onClick={() => onFinishTender(tender)}
          disabled={isPending}
          className="border border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
        />
        <ActionButton
          label="✗ Perdida"
          onClick={() => onLoseTender(tender)}
          disabled={isPending}
          className="border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
        />
      </div>
    );
  }

  if (tender.status === "POR_COBRAR") {
    return (
      <ActionButton
        label="Registrar Pago"
        onClick={() => onRegisterPayment(tender)}
        disabled={isPending}
        className="bg-yellow-600 text-white hover:bg-yellow-700"
      />
    );
  }

  if (tender.status === "BORRADOR") {
    return (
      <ActionButton
        label="Agregar Propuesta"
        onClick={() => onAddProposal(tender)}
        disabled={isPending}
        className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100"
      />
    );
  }

  return <span className="text-sm text-gray-600">—</span>;
}

export function TendersTable({
  tenders,
  pendingActionId,
  onFinishTender,
  onLoseTender,
  onRegisterPayment,
  onAddProposal,
  onOpenDetail,
}: TendersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[1.2px] text-gray-500">
            <th className="px-5 py-3 font-normal">Titulo</th>
            <th className="px-5 py-3 font-normal">Cliente</th>
            <th className="px-5 py-3 font-normal">Estado</th>
            <th className="px-5 py-3 font-normal">Fecha Final</th>
            <th className="px-5 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tenders.map((tender) => {
            const isPending = pendingActionId === tender.id;

            return (
              <tr
                key={tender.id}
                className="align-middle cursor-pointer transition hover:bg-gray-50"
                onClick={() => onOpenDetail(tender)}
              >
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {tender.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {"Costo total "}{formatCurrency(tender.productsAmount)} /{" "}
                      {"Presupuesto maximo "}{formatCurrency(tender.maxBudget)}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-600">
                  {tender.clientName}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={tender.status} />
                </td>
                <td className="px-5 py-4 text-xs text-gray-600">
                  {formatDate(tender.deadline)}
                </td>
                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                  {renderActions({
                    tender,
                    isPending,
                    onFinishTender,
                    onLoseTender,
                    onRegisterPayment,
                    onAddProposal,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
