import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="dash-wrap" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="dash-hero">
        <Skeleton width={130} height={14} />
        <div style={{ height: 10 }} />
        <Skeleton width="48%" height={28} />
        <div style={{ height: 8 }} />
        <Skeleton width="78%" height={14} />
        <div style={{ height: 14 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Skeleton width={140} height={38} radius={12} />
          <Skeleton width={140} height={38} radius={12} />
        </div>
      </div>

      <div className="dash-kpi-block">
        <Skeleton width={120} height={14} />
        <div className="dash-kpi-grid" style={{ marginTop: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-kpi-card">
              <Skeleton width="50%" height={10} />
              <div style={{ height: 12 }} />
              <Skeleton width="40%" height={26} />
              <div style={{ height: 6 }} />
              <Skeleton width="70%" height={10} />
            </div>
          ))}
        </div>
      </div>

      <div className="dash-panels">
        <div className="dash-panels-main">
          <div className="skeleton-card">
            <Skeleton width="40%" height={14} />
            <Skeleton width="100%" height={150} radius={12} />
          </div>
          <div className="skeleton-card">
            <Skeleton width="35%" height={14} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} width={110} height={70} radius={12} />
              ))}
            </div>
          </div>
        </div>
        <aside className="dash-panels-side">
          <div className="skeleton-card">
            <Skeleton width="50%" height={14} />
            <Skeleton width="100%" height={56} radius={12} />
            <Skeleton width="100%" height={56} radius={12} />
          </div>
        </aside>
      </div>
    </div>
  );
}
