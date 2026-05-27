import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilLoading() {
  return (
    <div className="profile-page" aria-busy="true" aria-label="Chargement du profil">
      <div className="card profile-hero" style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
        <Skeleton width={54} height={54} radius={999} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skeleton width={90} height={10} />
          <div style={{ height: 10 }} />
          <Skeleton width="55%" height={22} />
          <div style={{ height: 8 }} />
          <Skeleton width="70%" height={14} />
        </div>
      </div>

      <div className="profile-layout">
        <section className="card profile-panel">
          <Skeleton width={160} height={16} />
          <div style={{ height: 8 }} />
          <Skeleton width="85%" height={12} />
          <div style={{ height: 16 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <Skeleton width="28%" height={10} />
              <div style={{ height: 4 }} />
              <Skeleton width="72%" height={14} />
            </div>
          ))}
        </section>

        <section className="card profile-panel">
          <Skeleton width={120} height={16} />
          <div style={{ height: 8 }} />
          <Skeleton width="90%" height={12} />
          <div style={{ height: 14 }} />
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "1fr 1fr" }}>
            <Skeleton width="100%" height={100} radius={12} />
            <Skeleton width="100%" height={100} radius={12} />
          </div>
        </section>
      </div>

      <section className="card profile-edit-card">
        <Skeleton width={100} height={16} />
        <div style={{ height: 8 }} />
        <Skeleton width="75%" height={12} />
        <div style={{ height: 14 }} />
        <Skeleton width="100%" height={56} radius={12} />
      </section>
    </div>
  );
}
