"use client";

import type { AuthenticatedUser } from "@/src/shared/hooks/useAuth";

interface AdminHeaderProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  onGoBack: () => void;
}

export function AdminHeader({ user, onLogout, onGoBack }: AdminHeaderProps) {
  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoBack}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium tracking-[0.3px] text-gray-700 transition hover:bg-gray-100"
          >
            ← Volver al dashboard
          </button>
        </div>

        <div className="mr-auto flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600">
            <span className="text-[10px] font-bold text-white">A</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Administración
          </span>
        </div>

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