import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridSkeleton({ count = 8, className = "" }) {
  const n = Math.min(16, Math.max(1, Number(count) || 8));
  return (
    <div className={`product-grid four-cols ${className}`.trim()} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: n }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
