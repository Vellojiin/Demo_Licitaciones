"use client";

import { CalendarClock, Mail, Shield, User } from "lucide-react";
import type { UserListItem } from "@/src/modules/users/infrastructure/user.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface UserDetailModalProps {
  user: UserListItem;
  onClose: () => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return (
    <Modal title="Detalle de Usuario" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Nombre
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <User size={14} className="text-gray-400" />
            {user.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Email
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400" />
            {user.email}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Rol
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <Shield size={14} className="text-gray-400" />
            {user.role === "ADMIN" ? "Administrador" : "Usuario"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Fechas
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Creado: {formatDate(user.createdAt)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Actualizado: {formatDate(user.updatedAt)}
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