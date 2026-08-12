"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  listClients,
  type ClientListItem,
} from "@/src/modules/clients/infrastructure/client.service";
import { listProducts, type ProductListItem } from "@/src/modules/products/infrastructure/product.service";
import { listUsers, type UserListItem } from "@/src/modules/users/infrastructure/user.service";
import { useAuth, type AuthenticatedUser } from "@/src/shared/hooks/useAuth";
import { ClientsTable } from "@/src/modules/admin/ui/components/clients-table";
import { ClientDetailModal } from "@/src/modules/admin/ui/components/client-detail-modal";
import { CreateUserModal } from "@/src/modules/admin/ui/components/create-user-modal";
import { EditClientModal } from "@/src/modules/admin/ui/components/edit-client-modal";
import { EditProductModal } from "@/src/modules/admin/ui/components/edit-product-modal";
import { EditUserModal } from "@/src/modules/admin/ui/components/edit-user-modal";
import { ProductsTable } from "@/src/modules/admin/ui/components/products-table";
import { ProductDetailModal } from "@/src/modules/admin/ui/components/product-detail-modal";
import { UsersTable } from "@/src/modules/admin/ui/components/users-table";
import { UserDetailModal } from "@/src/modules/admin/ui/components/user-detail-modal";
import { AdminHeader } from "@/src/modules/admin/ui/components/admin-header";
import { CreateClientModal } from "@/src/modules/dashboard/ui/components/create-client-modal";
import { CreateProductModal } from "@/src/modules/dashboard/ui/components/create-product-modal";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado";
}

type AdminTab = "products" | "users" | "clients";

interface AdminPageProps {
  currentUser: AuthenticatedUser;
  initialProducts: ProductListItem[];
  initialUsers: UserListItem[];
  initialClients: ClientListItem[];
}

const tabs: { id: AdminTab; label: string }[] = [
  { id: "products", label: "Productos" },
  { id: "users", label: "Usuarios" },
  { id: "clients", label: "Clientes" },
];

const createLabels: Record<AdminTab, string> = {
  products: "+ Crear Producto",
  users: "+ Crear Usuario",
  clients: "+ Crear Cliente",
};

export function AdminPage({
  currentUser,
  initialProducts,
  initialUsers,
  initialClients,
}: AdminPageProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<ProductListItem[]>(initialProducts);
  const [users, setUsers] = useState<UserListItem[]>(initialUsers);
  const [clients, setClients] = useState<ClientListItem[]>(initialClients);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);

  const reloadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      setProducts(await listProducts());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const reloadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      setUsers(await listUsers());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const reloadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      setClients(await listClients());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  const renderTabContent = () => {
    if (activeTab === "products") {
      if (isLoadingProducts) {
        return <LoadingState />;
      }

      if (products.length === 0) {
        return (
          <EmptyState message="Aun no hay productos registrados. Usa el boton crear para agregar el primero." />
        );
      }

      return (
        <ProductsTable
          products={products}
          onEdit={setEditingProduct}
          onOpenDetail={setSelectedProduct}
        />
      );
    }

    if (activeTab === "users") {
      if (isLoadingUsers) {
        return <LoadingState />;
      }

      if (users.length === 0) {
        return (
          <EmptyState message="Aun no hay usuarios registrados. Usa el boton crear para agregar el primero." />
        );
      }

      return (
        <UsersTable
          users={users}
          onEdit={setEditingUser}
          onOpenDetail={setSelectedUser}
        />
      );
    }

    if (isLoadingClients) {
      return <LoadingState />;
    }

    if (clients.length === 0) {
      return (
        <EmptyState message="Aun no hay clientes registrados. Usa el boton crear para agregar el primero." />
      );
    }

    return (
      <ClientsTable
        clients={clients}
        onEdit={setEditingClient}
        onOpenDetail={setSelectedClient}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <AdminHeader
        user={currentUser}
        onLogout={logout}
        onGoBack={() => router.push("/dashboard")}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <section className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            <span className="font-serif">Panel de </span>
            <span className="font-serif italic">administración</span>
          </h1>
          <p className="text-sm text-gray-600">
            Gestiona productos, usuarios y clientes del sistema.
          </p>
        </section>

        <nav className="flex flex-wrap items-center gap-1 border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px rounded-t border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (activeTab === "products") setIsCreateProductOpen(true);
              if (activeTab === "users") setIsCreateUserOpen(true);
              if (activeTab === "clients") setIsCreateClientOpen(true);
            }}
            className="rounded bg-yellow-600 px-3 py-1.5 text-xs font-medium tracking-[0.3px] text-white transition hover:bg-yellow-700"
          >
            {createLabels[activeTab]}
          </button>
        </section>

        {renderTabContent()}
      </main>

      {isCreateProductOpen && (
        <CreateProductModal
          onClose={() => setIsCreateProductOpen(false)}
          onCreated={() => reloadProducts()}
        />
      )}
      {isCreateUserOpen && (
        <CreateUserModal
          onClose={() => setIsCreateUserOpen(false)}
          onCreated={() => reloadUsers()}
        />
      )}
      {isCreateClientOpen && (
        <CreateClientModal
          onClose={() => setIsCreateClientOpen(false)}
          onCreated={() => reloadClients()}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={() => reloadProducts()}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={() => reloadUsers()}
        />
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={() => reloadClients()}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <section className="flex min-h-80 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Cargando registros...</span>
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <section className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-sm text-gray-600">{message}</p>
    </section>
  );
}