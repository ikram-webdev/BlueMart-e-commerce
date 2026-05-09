export default function ProductCardSkeleton() {
  return (
    <article className="product-card card product-card-skeleton" aria-hidden="true">
      <div className="skeleton-block skeleton-image" />
      <div className="product-details">
        <div className="skeleton-line sm w-40" />
        <div className="skeleton-line lg" />
        <div className="skeleton-line md w-70" />
        <div className="skeleton-line sm w-35" />
        <div className="skeleton-actions">
          <div className="skeleton-line btn" />
          <div className="skeleton-line btn ghost" />
        </div>
      </div>
    </article>
  );
}
