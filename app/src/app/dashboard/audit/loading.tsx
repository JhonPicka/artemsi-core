import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <>
      <section className="card audit-intro" aria-busy="true" aria-label="Chargement audit">
        <Skeleton width={70} height={20} radius={999} />
        <div style={{ height: 10 }} />
        <Skeleton width="55%" height={22} />
        <div style={{ height: 8 }} />
        <Skeleton width="85%" height={12} />
      </section>
      <section className="card">
        <Skeleton width="42%" height={18} />
        <div style={{ height: 14 }} />
        <div className="audit-cal-layout" style={{ opacity: 0.85 }}>
          <div>
            <Skeleton width="55%" height={14} radius={8} />
            <div style={{ height: 10 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} width="100%" height={12} radius={4} />
              ))}
            </div>
            <div style={{ height: 8 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} width="100%" height={40} radius={10} />
              ))}
            </div>
          </div>
          <div>
            <Skeleton width="35%" height={14} radius={6} />
            <div style={{ height: 10 }} />
            <Skeleton width="100%" height={88} radius={12} />
            <div style={{ height: 10 }} />
            <Skeleton width="100%" height={72} radius={12} />
          </div>
        </div>
      </section>
    </>
  );
}
