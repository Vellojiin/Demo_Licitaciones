"use client";

import { useState } from "react";
import { Loader2, Lock, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { updateUser, type UserListItem } from "@/src/modules/users/infrastructure/user.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface EditUserModalProps {
  user: UserListItem;
  onClose: () => void;
  onUpdated?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

export function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">(user.role);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const hasPassword = password.length > 0;
    if (hasPassword && password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      await updateUser(user.id, {
        name,
        email,
        password: hasPassword ? password : undefined,
        role,
      });
      toast.success("Usuario actualizado correctamente");
      onUpdated?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Editar Usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="user-name" className={labelClassName}>
            Nombre
          </label>
          <div className="relative mt-2">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre completo"
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="user-email" className={labelClassName}>
            Email
          </label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              id="user-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@empresa.com"
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="user-password" className={labelClassName}>
            Contraseña
          </label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              id="user-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Dejar vacío para no cambiarla"
              minLength={6}
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="user-role" className={labelClassName}>
            Rol
          </label>
          <div className="relative mt-2">
            <Shield className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              id="user-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "ADMIN" | "USER")
              }
              disabled={isLoading}
              className={`${inputClassName} appearance-none pl-10`}
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}