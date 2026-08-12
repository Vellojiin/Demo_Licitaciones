import type { ProductListItem } from "@/src/modules/products/infrastructure/product.service";

interface ProductsTableProps {
  products: ProductListItem[];
  onEdit: (product: ProductListItem) => void;
  onOpenDetail: (product: ProductListItem) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProductsTable({ products, onEdit, onOpenDetail }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[1.2px] text-gray-500">
            <th className="px-5 py-3 font-normal">Nombre</th>
            <th className="px-5 py-3 font-normal">Descripción</th>
            <th className="px-5 py-3 font-normal">Precio base</th>
            <th className="px-5 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr
              key={product.id}
              className="cursor-pointer align-middle transition hover:bg-gray-50"
              onClick={() => onOpenDetail(product)}
            >
              <td className="px-5 py-4 text-sm font-medium text-gray-900">
                {product.name}
              </td>
              <td className="max-w-64 truncate px-5 py-4 text-xs text-gray-600">
                {product.description ?? "—"}
              </td>
              <td className="px-5 py-4 text-sm text-gray-900">
                {formatCurrency(product.basePrice)}
              </td>
              <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="rounded border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}