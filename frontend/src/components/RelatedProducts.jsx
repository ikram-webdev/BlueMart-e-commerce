import ProductCard from "./ProductCard";

function RelatedProducts({ title, products, onAddToCart, onAddWishlist, compact = false }) {
  return (
    <section className="card section-card">
      <div className="section-header">
        <h3>{title}</h3>
      </div>
      <div className={`product-grid ${compact ? "recent-grid" : "four-cols"}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddWishlist={onAddWishlist}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;
