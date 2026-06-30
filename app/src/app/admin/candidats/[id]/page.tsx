import { notFound } from "next/navigation";

import { AdminCandidateDetailView } from "@/components/admin/admin-candidate-detail";
import { loadAdminCandidateDetail } from "@/lib/admin-candidates";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCandidateDetailPage({ params }: Props) {
  const { id } = await params;

  let candidate: Awaited<ReturnType<typeof loadAdminCandidateDetail>> = null;
  let error: string | null = null;

  try {
    candidate = await loadAdminCandidateDetail(id);
  } catch (cause) {
    error =
      cause instanceof Error
        ? cause.message
        : "Impossible de charger le candidat.";
  }

  if (error) {
    return (
      <section className="admin-candidates-shell">
        <p className="error card" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (!candidate) {
    notFound();
  }

  return (
    <section className="admin-candidates-shell">
      <AdminCandidateDetailView candidate={candidate} />
    </section>
  );
}
