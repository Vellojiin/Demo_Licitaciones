import { redirect } from "next/navigation";
import { DashboardPage } from "@/src/modules/dashboard/ui/dashboard-page";
import { ListTenderUseCase } from "@/src/modules/tenders/application/use-cases/list-tender.use-case";
import { PrismaTenderRepository } from "@/src/modules/tenders/infrastructure/repos/prisma-tender.repository";
import { requireAuth } from "@/src/modules/auth/infrastructure/http/require-auth";

export default async function Dashboard() {
  let session;

  try {
    session = await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login");
    }

    throw error;
  }

  const repository = new PrismaTenderRepository();
  const useCase = new ListTenderUseCase(repository);
  const tenders = await useCase.execute();

  return (
    <DashboardPage
      currentUser={{
        id: session.userId,
        name: "name" in session && typeof session.name === "string"
          ? session.name
          : session.email,
        email: session.email,
        role: session.role,
      }}
      initialTenders={tenders.map((tender) => ({
        ...tender,
        deadline: tender.deadline.toISOString(),
      }))}
    />
  );
}
