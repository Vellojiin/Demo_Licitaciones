import type { UserListItem } from "@/src/modules/users/infrastructure/user.service";

interface UsersTableProps {
  users: UserListItem[];
  onEdit: (user: UserListItem) => void;
  onOpenDetail: (user: UserListItem) => void;
}

function RoleBadge({ role }: { role: UserListItem["role"] }) {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-[10px] font-medium uppercase tracking-[0.5px] ${
        isAdmin
          ? "border border-yellow-200 bg-yellow-50 text-yellow-700"
          : "border border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {role}
    </span>
  );
}

export function UsersTable({ users, onEdit, onOpenDetail }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[1.2px] text-gray-500">
            <th className="px-5 py-3 font-normal">Nombre</th>
            <th className="px-5 py-3 font-normal">Email</th>
            <th className="px-5 py-3 font-normal">Rol</th>
            <th className="px-5 py-3 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className="cursor-pointer align-middle transition hover:bg-gray-50"
              onClick={() => onOpenDetail(user)}
            >
              <td className="px-5 py-4 text-sm font-medium text-gray-900">
                {user.name}
              </td>
              <td className="px-5 py-4 text-xs text-gray-600">{user.email}</td>
              <td className="px-5 py-4">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEdit(user)}
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