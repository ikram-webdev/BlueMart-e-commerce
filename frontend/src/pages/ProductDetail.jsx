import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductTabs from "../components/ProductTabs";
import SellerCard from "../components/SellerCard";
import RelatedProducts from "../components/RelatedProducts";
import ProductDetailSkeleton from "../components/skeletons/ProductDetailSkeleton";
import { useCurrency } from "../context/CurrencyContext";
import { fallbackImage, getProductById, normalizeProducts } from "../data/products";
import { notify } from "../utils/notify";
import { api } from "../api/client";

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={`rating-star ${filled ? "filled" : ""}`} aria-hidden="true">
      <path d="m12 3.6 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.6z" />
    </svg>
  );
}

function ProductDetail({ handlers }) {
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const product = useMemo(() => getProductById(products, id), [products, id]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.images?.[0] || fallbackImage);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("Standard");

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts();
        if (!mounted) return;
        setProducts(normalizeProducts(res.products || []));
      } catch (_error) {
        if (!mounted) return;
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    const timer = setInterval(fetchProducts, 12000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [id]);

  useEffect(() => {
    setActiveImage(product?.images?.[0] || fallbackImage);
    setQty(1);
    setSelectedColor("Black");
    setSelectedSize("Standard");
  }, [product?.id]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <motion.main className="container product-not-found card glass-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Product not found</h2>
        <p>The SKU may be unpublished by the vendor or still syncing from the realtime catalog.</p>
        <Link className="primary-btn bluemart-gradient" to="/products">
          Back to products
        </Link>
      </motion.main>
    );
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const recentlyViewed = products.filter((item) => item.id !== product.id).slice(0, 8);
  const discount = product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const onVisitStore = () => {
    navigate(`/products?search=${encodeURIComponent(product.vendor || "")}`);
  };

  const onCompare = () => {
    const key = "bluemart_compare";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    const next = Array.isArray(prev) ? prev : [];
    if (!next.some((item) => Number(item.id) === Number(product.id))) {
      next.push({ id: product.id, title: product.title, price: product.price, vendor: product.vendor });
      localStorage.setItem(key, JSON.stringify(next.slice(-8)));
    }
    notify("Added to compare list", "success");
  };

  const withVariant = (item) => ({
    ...item,
    selected_color: selectedColor,
    selected_size: selectedSize,
    quantity: qty,
  });

  const onAddToCartWithVariant = () => {
    if (!selectedColor || !selectedSize) {
      notify("Please select color and size first.", "warning");
      return;
    }
    handlers.onAddToCart(withVariant(product));
    notify(`Added (${selectedColor}, ${selectedSize})`, "success");
  };

  const onBuyNowWithVariant = () => {
    if (!selectedColor || !selectedSize) {
      notify("Please select color and size first.", "warning");
      return;
    }
    handlers.onBuyNow?.(withVariant(product), qty);
  };

  return (
    <motion.main className="product-detail-page container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <nav className="breadcrumb">
        <Link to="/">Home</Link> <span>›</span> <Link to="/products">{product.category}</Link> <span>›</span> <strong>{product.title}</strong>
      </nav>

      <section className="product-main-grid">
        <article className="product-gallery card">
          <div className="main-image-wrap">
            <img src={activeImage} alt={product.title} onError={(event) => { event.currentTarget.src = fallbackImage; }} />
            {discount > 0 ? <span className="discount-badge">Sale -{discount}%</span> : null}
          </div>
          <div className="thumb-row">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                className={activeImage === image ? "active" : ""}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt={product.title} onError={(event) => { event.currentTarget.src = fallbackImage; }} />
              </button>
            ))}
          </div>
        </article>

        <article className="product-info card">
          <h1>{product.title}</h1>
          <p className="product-store">
            Sold by <strong>{product.vendor}</strong> •{" "}
            <button type="button" className="link-btn-inline" onClick={onVisitStore}>Visit Store</button>
          </p>
          <p className="rating">
            <span className="rating-stars-wrap">
              {[1, 2, 3, 4, 5].map((item) => (
                <StarIcon key={item} filled={item <= product.rating} />
              ))}
            </span>
            <small>({product.reviews} reviews)</small>
          </p>
          <div className="price-line">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice > product.price ? <span>{formatPrice(product.oldPrice)}</span> : null}
            {discount > 0 ? <em>{discount}% OFF</em> : null}
          </div>
          <p className={`stock ${product.stock > 0 ? "in" : "out"}`}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
          <p>{product.description}</p>

          <div className="option-row">
            <label>Color</label>
            <div className="chip-set">
              {["Black", "Silver", "Blue"].map((color) => (
                <button
                  key={color}
                  type="button"
                  className={selectedColor === color ? "is-active" : ""}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          <div className="option-row">
            <label>Size</label>
            <div className="chip-set">
              {["Standard", "Pro"].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={selectedSize === size ? "is-active" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="option-row">
            <label>Quantity</label>
            <div className="qty-control">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))}>-</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((value) => value + 1)}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <motion.button type="button" className="primary-btn bluemart-gradient" onClick={onAddToCartWithVariant} whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(59,130,246,0.45)" }} whileTap={{ scale: 0.98 }}>Add to Cart</motion.button>
            <motion.button type="button" className="ghost-btn" onClick={onBuyNowWithVariant} whileTap={{ scale: 0.98 }}>Buy Now</motion.button>
            <button type="button" className="ghost-btn" onClick={() => handlers.onAddWishlist(product)}>Wishlist</button>
            <button type="button" className="ghost-btn" onClick={onCompare}>Compare</button>
          </div>

          <ul className="delivery-list">
            <li>Free Delivery</li>
            <li>Cash on Delivery</li>
            <li>7 Days Return</li>
            <li>Warranty Available</li>
          </ul>
        </article>

        <SellerCard product={product} onVisitStore={onVisitStore} />
      </section>

      <ProductTabs product={product} />
      <RelatedProducts title="Related Products" products={related} onAddToCart={handlers.onAddToCart} onAddWishlist={handlers.onAddWishlist} />
      <RelatedProducts title="Recently Viewed" products={recentlyViewed} onAddToCart={handlers.onAddToCart} onAddWishlist={handlers.onAddWishlist} compact />

      <div className="mobile-sticky-actions">
        <button type="button" className="ghost-btn" onClick={onBuyNowWithVariant}>Buy Now</button>
        <button type="button" className="primary-btn" onClick={onAddToCartWithVariant}>Add to Cart</button>
      </div>
    </motion.main>
  );
}

export default ProductDetail;
