import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { formatPkr } from "../utils/price";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.getProduct(id).then((res) => setProduct(res.product));
  }, [id]);

  if (!product) return <main className="container">Loading product...</main>;

  const image = product.thumbnail || product.image || product.image_url || "https://via.placeholder.com/500x420?text=Product";
  return (
    <main className="container product-detail card">
      <img src={image} alt={product.name} />
      <div>
        <h2>{product.name}</h2>
        <p className="price">{formatPkr(product.discount_price || product.price)}</p>
        <p>Vendor: {product.store_name}</p>
        <p>Stock: {product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
        <div className="qty-row">
          <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <button onClick={() => api.addToCart({ product_id: Number(id), quantity: qty })}>Add to Cart</button>
          <button onClick={() => api.addWishlist({ product_id: Number(id) })}>Add to Wishlist</button>
        </div>
        <p>{product.description}</p>
      </div>
    </main>
  );
}

export default ProductDetailPage;
