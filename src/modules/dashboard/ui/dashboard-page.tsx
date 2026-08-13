"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  finishTender,
  listDashboardTenders,
  loseTender,
  tenderToCollect,
  type DashboardTender,
} from "@/src/modules/dashboard/infrastructure/dashboard.service";
import { DashboardHeader } from "@/src/modules/dashboard/ui/components/dashboard-header";
import { TendersTable } from "@/src/modules/dashboard/ui/components/tenders-table";
import { AddProposalModal } from "@/src/modules/dashboard/ui/components/add-proposal-modal";
import { CreateClientModal } from "@/src/modules/dashboard/ui/components/create-client-modal";
import { CreateProductModal } from "@/src/modules/dashboard/ui/components/create-product-modal";
import { CreateTenderModal } from "@/src/modules/dashboard/ui/components/create-tender-modal";
import { PaymentModal } from "@/src/modules/dashboard/ui/components/payment-modal";
import { TenderDetailModal } from "@/src/modules/dashboard/ui/components/tender-detail-modal";
import { useAuth, type AuthenticatedUser } from "@/src/shared/hooks/useAuth";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado";
}

interface DashboardPageProps {
  currentUser: AuthenticatedUser;
  initialTenders: DashboardTender[];
}

export function DashboardPage({
  currentUser,
  initialTenders,
}: DashboardPageProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [tenders, setTenders] = useState<DashboardTender[]>(initialTenders);
  const [activeTab, setActiveTab] = useState<"activas" | "finalizadas">("activas");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [proposalTender, setProposalTender] = useState<DashboardTender | null>(null);
  const [selectedTender, setSelectedTender] = useState<DashboardTender | null>(null);
  const [paymentTender, setPaymentTender] = useState<DashboardTender | null>(null);

  const loadTenders = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const dashboardTenders = await listDashboardTenders();
      setTenders(dashboardTenders);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  const activeTendersCount = useMemo(
    () => tenders.filter((tender) => tender.status === "ACTIVA").length,
    [tenders]
  );

  const activeTenders = useMemo(
    () =>
      tenders.filter((tender) =>
        ["BORRADOR", "ACTIVA", "FINALIZADA", "POR_COBRAR"].includes(tender.status)
      ),
    [tenders]
  );

  const closedTenders = useMemo(
    () =>
      tenders.filter((tender) =>
        ["PERDIDA", "COBRADA"].includes(tender.status)
      ),
    [tenders]
  );

  const handleToCollectTender = async (tender: DashboardTender) => {
    setPendingActionId(tender.id);

    try {
      await finishTender(tender.id);
      await tenderToCollect(tender.id);
      toast.success("Licitación actualizada");
      await loadTenders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleLoseTender = async (tender: DashboardTender) => {
    setPendingActionId(tender.id);

    try {
      await loseTender(tender.id);
      toast.success("Licitación actualizada");
      await loadTenders();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRegisterPayment = (tender: DashboardTender) => {
    setPaymentTender(tender);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <DashboardHeader
        user={currentUser}
        onLogout={logout}
        onNewClient={() => setIsClientModalOpen(true)}
        onNewProduct={() => setIsProductModalOpen(true)}
        onNewTender={() => setIsTenderModalOpen(true)}
        onOpenAdmin={() => router.push("/admin")}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <section className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            <span className="font-serif">Licitaciones </span>
            <span className="font-serif italic">
              {activeTab === "activas" ? "activas" : "finalizadas"}
            </span>
          </h1>
          <p className="text-sm text-gray-600">
            {activeTab === "activas"
              ? `${activeTendersCount} activas de ${tenders.length} en total`
              : `${closedTenders.length} finalizadas de ${tenders.length} en total`}
          </p>
        </section>

        <nav className="flex flex-wrap items-center gap-1 border-b border-gray-200">
          {[
            { id: "activas" as const, label: "Activas" },
            { id: "finalizadas" as const, label: "Finalizadas" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex items-center gap-2 rounded-t border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.id === "activas"
                    ? activeTenders.length
                    : closedTenders.length}
                </span>
              </button>
            );
          })}
        </nav>

        {isLoading ? (
          <section className="flex min-h-80 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando dashboard...</span>
            </div>
          </section>
        ) : activeTab === "finalizadas" ? (
          closedTenders.length === 0 ? (
            <section className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-lg font-medium text-gray-900">
                Aun no hay licitaciones perdidas o cobradas
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                La licitaciones que se ganen o pierdan apareceran aqui.
              </p>
            </section>
          ) : (
            <TendersTable
              tenders={closedTenders}
              pendingActionId={pendingActionId}
              onFinishTender={handleToCollectTender}
              onLoseTender={handleLoseTender}
              onRegisterPayment={handleRegisterPayment}
              onAddProposal={setProposalTender}
              onOpenDetail={setSelectedTender}
            />
          )
        ) : activeTenders.length === 0 ? (
          <section className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">
              Aun no hay licitaciones registradas
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Usa el acceso rapido de{" "}
              <span className="font-medium text-gray-900">+ Licitacion</span>{" "}
              para comenzar a cargar la primera.
            </p>
          </section>
        ) : (
          <TendersTable
            tenders={activeTenders}
            pendingActionId={pendingActionId}
            onFinishTender={handleToCollectTender}
            onLoseTender={handleLoseTender}
            onRegisterPayment={handleRegisterPayment}
            onAddProposal={setProposalTender}
            onOpenDetail={setSelectedTender}
          />
        )}
      </main>

      {isClientModalOpen && (
        <CreateClientModal onClose={() => setIsClientModalOpen(false)} />
      )}
      {isProductModalOpen && (
        <CreateProductModal onClose={() => setIsProductModalOpen(false)} />
      )}
      {isTenderModalOpen && (
        <CreateTenderModal
          onClose={() => setIsTenderModalOpen(false)}
          onCreated={() => loadTenders()}
        />
      )}
      {proposalTender && (
        <AddProposalModal
          tender={proposalTender}
          onClose={() => setProposalTender(null)}
          onUpdated={() => loadTenders()}
        />
      )}
      {selectedTender && (
        <TenderDetailModal
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
          onRegisterPayment={(tender) => {
            setSelectedTender(null);
            setPaymentTender(tender);
          }}
        />
      )}
      {paymentTender && (
        <PaymentModal
          tender={paymentTender}
          onClose={() => setPaymentTender(null)}
          onPaid={() => loadTenders()}
        />
      )}
    </div>
  );
}
