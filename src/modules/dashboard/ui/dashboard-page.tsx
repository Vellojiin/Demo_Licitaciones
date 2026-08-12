"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const [tenders, setTenders] = useState<DashboardTender[]>(initialTenders);
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
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <section className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            <span className="font-serif">Licitaciones </span>
            <span className="font-serif italic">activas</span>
          </h1>
          <p className="text-sm text-gray-600">
            {activeTendersCount} activas de {tenders.length} en total
          </p>
        </section>

        {isLoading ? (
          <section className="flex min-h-80 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando dashboard...</span>
            </div>
          </section>
        ) : tenders.length === 0 ? (
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
            tenders={tenders}
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
