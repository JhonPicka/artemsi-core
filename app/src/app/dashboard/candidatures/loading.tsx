import { Skeleton } from "@/components/ui/skeleton";

export default function CandidaturesLoading() {
  return (
    <section className="card" aria-busy="true" aria-label="Chargement des candidatures">
      <div className="applications-summary">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width={92} height={36} radius={999} />
        ))}
      </div>
      <div style={{ height: 14 }} />
      <div className="applications-toolbar">
        <Skeleton width="60%" height={42} radius={12} />
        <Skeleton width={170} height={42} radius={12} />
      </div>
      <div style={{ height: 16 }} />
      <ul className="applications-list" style={{ listStyle: "none" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="skeleton-row">
            <div style={{ display: "grid", gap: 6, flex: 1 }}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="78%" height={11} />
            </div>
            <Skeleton width={120} height={28} radius={999} />
          </li>
        ))}
      </ul>
    </section>
  );
}
