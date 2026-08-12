"use client";

import Image from "next/image";
import type { AuthenticatedUser } from "@/src/shared/hooks/useAuth";

interface DashboardHeaderProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  onNewClient: () => void;
  onNewProduct: () => void;
  onNewTender: () => void;
}

const quickActions = [
  { label: "+ Cliente", onAction: "onNewClient" as const, variant: "secondary" as const },
  { label: "+ Producto", onAction: "onNewProduct" as const, variant: "secondary" as const },
  { label: "+ Licitación", onAction: "onNewTender" as const, variant: "primary" as const },
];

export function DashboardHeader({
  user,
  onLogout,
  onNewClient,
  onNewProduct,
  onNewTender,
}: DashboardHeaderProps) {
  const userInitial = user.name.charAt(0).toUpperCase();

  const actionHandlers: Record<string, () => void> = {
    onNewClient,
    onNewProduct,
    onNewTender,
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
        <div className="mr-auto flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-yellow-600">
            <Image
              src="/licitagov-icon.svg"
              alt="LicitaGov"
              width={14}
              height={14}
              className="h-3.5 w-3.5"
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            LicitaGov
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={actionHandlers[action.onAction]}
              className={
                action.variant === "primary"
                  ? "rounded bg-yellow-600 px-3 py-1.5 text-xs font-medium tracking-[0.3px] text-white transition hover:bg-yellow-700"
                  : "rounded border border-gray-300 px-3 py-1.5 text-xs font-medium tracking-[0.3px] text-gray-700 transition hover:bg-gray-100"
              }
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="hidden h-5 w-px bg-gray-200 md:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-yellow-600 bg-yellow-100 text-[10px] font-bold text-yellow-700">
            {userInitial}
          </div>
          <span className="text-xs text-gray-600">{user.name}</span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded px-3 py-1.5 text-xs font-medium tracking-[0.3px] text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
