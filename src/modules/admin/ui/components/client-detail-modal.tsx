"use client";

import { Building2, CalendarClock, IdCard, Mail, Phone } from "lucide-react";
import type { ClientListItem } from "@/src/modules/clients/infrastructure/client.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface ClientDetailModalProps {
  client: ClientListItem;
  onClose: () => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ClientDetailModal({ client, onClose }: ClientDetailModalProps) {
  return (
    <Modal title="Detalle de Cliente" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Empresa
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <Building2 size={14} className="text-gray-400" />
            {client.companyName}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Contacto
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-gray-400" />
            {client.contactName ?? "Sin contacto"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Email
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400" />
            {client.email}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Fechas
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Creado: {formatDate(client.createdAt)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Actualizado: {formatDate(client.updatedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Auditoría
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <IdCard size={14} className="text-gray-400" />
            Creado por: <span className="font-mono text-xs">{client.createdById}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <IdCard size={14} className="text-gray-400" />
            Actualizado por: <span className="font-mono text-xs">{client.updatedById}</span>
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}