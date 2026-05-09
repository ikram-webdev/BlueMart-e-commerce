export default function ProductDetailSkeleton() {
  return (
    <main className="container product-detail-page" aria-busy="true" aria-label="Loading product">
      <div className="breadcrumb skeleton-line sm w-50" style={{ height: 14, borderRadius: 8 }} />
      <div className="product-main-grid">
        <section className="product-gallery card">
          <div className="skeleton-block main-gallery" />
          <div className="thumb-row">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="skeleton-block thumb" />
            ))}
          </div>
        </section>
        <section className="product-info card">
          <div className="skeleton-line md w-55" />
          <div className="skeleton-line lg" style={{ marginTop: 10 }} />
          <div className="skeleton-line sm w-40" style={{ marginTop: 16 }} />
          <div className="skeleton-line xl" style={{ marginTop: 20 }} />
          <div className="skeleton-line md" style={{ marginTop: 14 }} />
          <div className="detail-actions" style={{ marginTop: 18 }}>
            <div className="skeleton-line btn-wide" />
            <div className="skeleton-line btn-wide ghost" />
          </div>
        </section>
      </div>
    </main>
  );
}
