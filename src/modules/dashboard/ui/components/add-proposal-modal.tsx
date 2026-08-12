"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUp, LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listProducts } from "@/src/modules/products/infrastructure/product.service";
import type { ProductListItem } from "@/src/modules/products/infrastructure/product.service";
import {
  addTenderProduct,
  getTenderDetail,
  removeTenderProduct,
  sendTender,
  uploadProposalDocument,
  type TenderDetail,
} from "@/src/modules/tenders/infrastructure/tender.service";
import type { DashboardTender } from "@/src/modules/dashboard/infrastructure/dashboard.service";
import { Modal } from "@/src/modules/dashboard/ui/components/modal";

interface AddProposalModalProps {
  tender: DashboardTender;
  onClose: () => void;
  onUpdated: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const labelClassName = "block text-sm font-medium text-black";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AddProposalModal({ tender, onClose, onUpdated }: AddProposalModalProps) {
  const [detail, setDetail] = useState<TenderDetail | null>(null);
  const [catalog, setCatalog] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [newProductId, setNewProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newUnitPrice, setNewUnitPrice] = useState("");
  const [addingError, setAddingError] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);

  const loadDetail = useCallback(async () => {
    const data = await getTenderDetail(tender.id);
    setDetail(data);
  }, [tender.id]);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        const [detailData, catalogData] = await Promise.all([
          getTenderDetail(tender.id),
          listProducts(),
        ]);

        if (!mounted) {
          return;
        }

        setDetail(detailData);
        setCatalog(catalogData);
      } catch (error) {
        if (mounted) {
          const message =
            error instanceof Error ? error.message : "Ocurrió un error inesperado";
          toast.error(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      mounted = false;
    };
  }, [tender.id]);

  const maxBudget = detail?.tender.maxBudget ?? tender.maxBudget;
  const productsTotal = detail?.totals.productsAmount ?? 0;
  const remainingBudget = maxBudget - productsTotal;
  const hasProposal = Boolean(detail?.tender.proposalDocumentUrl);

  const selectedProduct = catalog.find((product) => product.id === newProductId);
  const quantity = Number(newQuantity);
  const unitPrice = Number(newUnitPrice);
  const lineTotal = Number.isFinite(quantity) && Number.isFinite(unitPrice)
    ? quantity * unitPrice
    : 0;
  const wouldExceedBudget = productsTotal + lineTotal > maxBudget;

  const handleSelectProduct = (productId: string) => {
    setNewProductId(productId);
    setNewUnitPrice("");
    const product = catalog.find((item) => item.id === productId);
    if (product) {
      setNewUnitPrice(product.basePrice.toString());
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploadingDoc(true);
    try {
      await uploadProposalDocument(tender.id, selectedFile);
      toast.success("Documento de propuesta subido correctamente");
      setSelectedFile(null);
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductId) {
      setAddingError("Selecciona un producto");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setAddingError("Ingresa una cantidad valida mayor a cero");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setAddingError("Ingresa un precio unitario valido mayor a cero");
      return;
    }

    if (wouldExceedBudget) {
      setAddingError(
        `El total (${formatCurrency(productsTotal + lineTotal)}) supera el presupuesto maximo (${formatCurrency(maxBudget)})`
      );
      return;
    }

    setIsAddingProduct(true);
    setAddingError(null);

    try {
      await addTenderProduct({
        tenderId: tender.id,
        productId: newProductId,
        quantity,
        unitPrice,
      });
      toast.success("Producto agregado correctamente");
      setNewProductId("");
      setNewQuantity("1");
      setNewUnitPrice("");
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    setRemovingProductId(productId);

    try {
      await removeTenderProduct(tender.id, productId);
      toast.success("Producto eliminado");
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleSend = async () => {
    if (!hasProposal) {
      toast.error("Adjunta el documento de propuesta antes de enviar");
      return;
    }

    setIsSending(true);

    try {
      await sendTender(tender.id);
      toast.success("Licitación enviada y activada");
      onUpdated();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const isBusy = isLoading || isSending || isUploadingDoc || isAddingProduct;

  return (
    <Modal title="Agregar Propuesta" onClose={onClose} className="max-w-2xl">
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando licitacion...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.5px] text-gray-500">
              Documento de propuesta
            </h3>

            {hasProposal && detail?.tender.proposalDocumentUrl && (
              <a
                href={detail.tender.proposalDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Ver documento actual
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                id="proposal-file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                disabled={isBusy}
                className="block w-full max-w-xs text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              />
              <button
                type="button"
                onClick={handleUploadDocument}
                disabled={isBusy || !selectedFile}
                className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingDoc ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileUp size={14} />
                )}
                Subir documento
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.5px] text-gray-500">
                Productos
              </h3>
              <p className="text-xs text-gray-600">
                Total: <span className="font-medium text-gray-900">{formatCurrency(productsTotal)}</span>{" "}
                / Presupuesto:{" "}
                <span className="font-medium text-gray-900">{formatCurrency(maxBudget)}</span>{" "}
                <span className={remainingBudget < 0 ? "text-red-600" : "text-gray-500"}>
                  (Restante: {formatCurrency(remainingBudget)})
                </span>
              </p>
            </div>

            {detail && detail.products.length > 0 ? (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {detail.products.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.lineTotal)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Eliminar ${item.productName}`}
                        onClick={() => handleRemoveProduct(item.productId)}
                        disabled={isBusy || removingProductId === item.productId}
                        className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingProductId === item.productId ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Aun no hay productos en esta licitacion.
              </p>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid max-w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_90px_120px_auto]">
                <div>
                  <label htmlFor="product-select" className={labelClassName}>
                    Producto
                  </label>
                  <select
                    id="product-select"
                    value={newProductId}
                    onChange={(event) => handleSelectProduct(event.target.value)}
                    disabled={isBusy}
                    className={`${inputClassName} mt-2 bg-white`}
                  >
                    <option value="">
                      {catalog.length === 0 ? "No hay productos registrados" : "Selecciona un producto"}
                    </option>
                    {catalog.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="product-quantity" className={labelClassName}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="product-quantity"
                    min="1"
                    step="1"
                    value={newQuantity}
                    onChange={(event) => setNewQuantity(event.target.value)}
                    disabled={isBusy}
                    className={`${inputClassName} mt-2`}
                  />
                </div>

                <div>
                  <label htmlFor="product-price" className={labelClassName}>
                    Precio unitario
                  </label>
                  <input
                    type="number"
                    id="product-price"
                    min="0"
                    step="0.01"
                    value={newUnitPrice}
                    onChange={(event) => setNewUnitPrice(event.target.value)}
                    disabled={isBusy}
                    placeholder={selectedProduct ? selectedProduct.basePrice.toString() : ""}
                    className={`${inputClassName} mt-2`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={isBusy || catalog.length === 0 || !selectedProduct}
                    className="inline-flex items-center gap-1.5 rounded bg-yellow-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isAddingProduct ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Agregar
                  </button>
                </div>
              </div>

              {newProductId && Number.isFinite(lineTotal) && lineTotal > 0 && (
                <p className="mt-3 text-xs text-gray-600">
                  Linea: {formatCurrency(lineTotal)} —{" "}
                  {wouldExceedBudget ? (
                    <span className="font-medium text-red-600">
                      Supera el presupuesto maximo
                    </span>
                  ) : (
                    <span className="font-medium text-green-700">Dentro del presupuesto</span>
                  )}
                </p>
              )}

              {addingError && <p className="mt-2 text-xs text-red-600">{addingError}</p>}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cerrar
            </button>
            {tender.status === "BORRADOR" && (
              <button
                type="button"
                onClick={handleSend}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSending && <Loader2 size={18} className="animate-spin" />}
                Enviar Licitación
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}