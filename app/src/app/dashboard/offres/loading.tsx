import { Skeleton } from "@/components/ui/skeleton";

function OffersSkeletonSection({ title }: { title: string }) {
  return (
    <section className="offers-section" aria-busy="true" aria-label={`Chargement ${title}`}>
      <div className="offers-section-header">
        <Skeleton width={160} height={18} />
      </div>
      <div className="offers-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="offer-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Skeleton width={70} height={22} radius={999} />
              <Skeleton width={70} height={22} radius={999} />
            </div>
            <Skeleton width="80%" height={18} />
            <Skeleton width="60%" height={12} />
            <Skeleton width={90} height={12} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function OffersLoading() {
  return (
    <>
      <OffersSkeletonSection title="Pour toi" />
      <OffersSkeletonSection title="Offres exclusives" />
      <OffersSkeletonSection title="Jobboard" />
    </>
  );
}
