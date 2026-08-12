"use client";

import { useEffect, useState } from "react";
import { Loader2, Tag, FileText, DollarSign, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";
import { listClients } from "@/src/modules/clients/infrastructure/client.service";
import { createTender } from "@/src/modules/tenders/infrastructure/tender.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface CreateTenderModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

export function CreateTenderModal({ onClose, onCreated }: CreateTenderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Awaited<ReturnType<typeof listClients>>>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadClients = async () => {
      try {
        const data = await listClients();
        if (mounted) {
          setClients(data);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ocurrió un error inesperado";
        toast.error(message);
      } finally {
        if (mounted) {
          setIsLoadingClients(false);
        }
      }
    };

    loadClients();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const budget = Number(maxBudget);
    if (!Number.isFinite(budget) || budget <= 0) {
      toast.error("Ingresa un presupuesto maximo mayor a cero");
      setIsLoading(false);
      return;
    }

    try {
      await createTender({
        title,
        description: description || undefined,
        maxBudget: budget,
        deadline,
        clientId,
      });
      toast.success("Licitación creada correctamente");
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
    <Modal title="Nueva Licitación" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="tender-title" className={labelClassName}>
            Titulo
          </label>
          <div className="relative mt-2">
            <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              id="tender-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Licitación de equipos"
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tender-description" className={labelClassName}>
            Descripcion
          </label>
          <div className="relative mt-2">
            <FileText
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <textarea
              id="tender-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descripcion opcional"
              rows={3}
              disabled={isLoading}
              className={`${inputClassName} pl-10 resize-none`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="maxBudget" className={labelClassName}>
              Presupuesto maximo
            </label>
            <div className="relative mt-2">
              <DollarSign
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="number"
                id="maxBudget"
                min="0"
                step="0.01"
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                placeholder="0.00"
                required
                disabled={isLoading}
                className={`${inputClassName} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="deadline" className={labelClassName}>
              Fecha final
            </label>
            <div className="relative mt-2">
              <Calendar
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                disabled={isLoading}
                className={`${inputClassName} pl-10`}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="clientId" className={labelClassName}>
            Cliente
          </label>
          <div className="relative mt-2">
            <Building2
              className="absolute left-3 top-3 pointer-events-none text-gray-400"
              size={20}
            />
            <select
              id="clientId"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
              disabled={isLoading || isLoadingClients || clients.length === 0}
              className={`${inputClassName} pl-10 bg-white`}
            >
              <option value="">
                {isLoadingClients
                  ? "Cargando clientes..."
                  : clients.length === 0
                    ? "No hay clientes registrados"
                    : "Selecciona un cliente"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>
          {!isLoadingClients && clients.length === 0 && (
            <p className="mt-1 text-xs text-gray-600">
              Crea un cliente antes de registrar una licitacion.
            </p>
          )}
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
            disabled={isLoading || isLoadingClients || clients.length === 0}
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Creando..." : "Crear Licitación"}
          </button>
        </div>
      </form>
    </Modal>
  );
}