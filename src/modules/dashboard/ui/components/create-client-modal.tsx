"use client";

import { useState } from "react";
import { Building2, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/src/modules/clients/infrastructure/client.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface CreateClientModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

export function CreateClientModal({ onClose, onCreated }: CreateClientModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await createClient({
        companyName,
        contactName: contactName || undefined,
        email,
      });
      toast.success("Cliente creado correctamente");
      onCreated?.();
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
    <Modal title="Nuevo Cliente" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="companyName" className={labelClassName}>
            Nombre de la empresa
          </label>
          <div className="relative mt-2">
            <Building2
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Empresa S.A."
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contactName" className={labelClassName}>
            Nombre de contacto
          </label>
          <div className="relative mt-2">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              id="contactName"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="Juan Pérez"
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="contacto@empresa.com"
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
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
            {isLoading ? "Creando..." : "Crear Cliente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}