"use client";

import { Banknote, CalendarClock, IdCard, Package } from "lucide-react";
import type { ProductListItem } from "@/src/modules/products/infrastructure/product.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface ProductDetailModalProps {
  product: ProductListItem;
  onClose: () => void;
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

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  return (
    <Modal title="Detalle de Producto" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Nombre
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <Package size={14} className="text-gray-400" />
            {product.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Descripción
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {product.description ?? "Sin descripción"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Precio base
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
            <Banknote size={14} className="text-gray-400" />
            {formatCurrency(product.basePrice)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Fechas
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Creado: {formatDate(product.createdAt)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <CalendarClock size={14} className="text-gray-400" />
            Actualizado: {formatDate(product.updatedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.5px] text-gray-500">
            Auditoría
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <IdCard size={14} className="text-gray-400" />
            Creado por: <span className="font-mono text-xs">{product.createdById}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <IdCard size={14} className="text-gray-400" />
            Actualizado por: <span className="font-mono text-xs">{product.updatedById}</span>
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