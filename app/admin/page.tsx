import { redirect } from "next/navigation";
import { AdminPage } from "@/src/modules/admin/ui/admin-page";
import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";
import { PrismaClientRepository } from "@/src/modules/clients/infrastructure/repos/prisma-client.repository";
import { ListProductUseCase } from "@/src/modules/products/application/use-cases/list-product.use-case";
import { PrismaProductRepository } from "@/src/modules/products/infrastructure/repos/prisma-product.repository";
import { ListUsersUseCase } from "@/src/modules/users/application/use-cases/list-users.use-case";
import { PrismaUserRepository } from "@/src/modules/users/infrastructure/repos/prisma-user.repository";

export default async function Admin() {
  let session;

  try {
    session = await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    throw error;
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const productRepository = new PrismaProductRepository();
  const clientRepository = new PrismaClientRepository();
  const userRepository = new PrismaUserRepository();

  const [products, clients, users] = await Promise.all([
    new ListProductUseCase(productRepository).execute(),
    clientRepository.findAll(),
    new ListUsersUseCase(userRepository).execute(),
  ]);

  return (
    <AdminPage
      currentUser={{
        id: session.userId,
        name: "name" in session && typeof session.name === "string"
          ? session.name
          : session.email,
        email: session.email,
        role: session.role,
      }}
      initialProducts={products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }))}
      initialClients={clients.map((client) => ({
        ...client,
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      }))}
      initialUsers={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))}
    />
  );
}