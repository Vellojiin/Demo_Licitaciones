import type { ClientListItem } from "@/src/modules/clients/infrastructure/client.service";

interface ClientsTableProps {
  clients: ClientListItem[];
  onEdit: (client: ClientListItem) => void;
  onOpenDetail: (client: ClientListItem) => void;
}

export function ClientsTable({ clients, onEdit, onOpenDetail }: ClientsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[1.2px] text-gray-500">
            <th className="px-5 py-3 font-normal">Empresa</th>
            <th className="px-5 py-3 font-normal">Contacto</th>
            <th className="px-5 py-3 font-normal">Email</th>
            <th className="px-5 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="cursor-pointer align-middle transition hover:bg-gray-50"
              onClick={() => onOpenDetail(client)}
            >
              <td className="px-5 py-4 text-sm font-medium text-gray-900">
                {client.companyName}
              </td>
              <td className="px-5 py-4 text-xs text-gray-600">
                {client.contactName ?? "—"}
              </td>
              <td className="px-5 py-4 text-xs text-gray-600">{client.email}</td>
              <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEdit(client)}
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