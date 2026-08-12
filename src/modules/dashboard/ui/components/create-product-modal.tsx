"use client";

import { useState } from "react";
import { Loader2, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/src/modules/products/infrastructure/product.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface CreateProductModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

export function CreateProductModal({ onClose, onCreated }: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const price = Number(basePrice);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Ingresa un precio base valido mayor o igual a cero");
      setIsLoading(false);
      return;
    }

    try {
      await createProduct({
        name,
        description: description || undefined,
        basePrice: price,
      });
      toast.success("Producto creado correctamente");
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
    <Modal title="Nuevo Producto" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="product-name" className={labelClassName}>
            Nombre
          </label>
          <div className="relative mt-2">
            <Package className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Licuadora industrial"
              required
              disabled={isLoading}
              className={`${inputClassName} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClassName}>
            Descripcion
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion opcional del producto"
            rows={3}
            disabled={isLoading}
            className={`${inputClassName} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="basePrice" className={labelClassName}>
            Precio base
          </label>
          <div className="relative mt-2">
            <DollarSign
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="number"
              id="basePrice"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              placeholder="0.00"
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
            {isLoading ? "Creando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}