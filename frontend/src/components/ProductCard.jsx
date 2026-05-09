import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";
import { fallbackImage } from "../data/products";

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" className={`rating-star ${filled ? "filled" : ""}`} aria-hidden="true">
      <path d="m12 3.6 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.6z" />
    </svg>
  );
}

function ProductCard({ product, onAddToCart, onAddWishlist, compact = false }) {
  const { formatPrice } = useCurrency();
  const title = product.title || product.name || "Product";
  const image = product.images?.[0] || product.thumbnail || fallbackImage;
  const vendor = product.vendor || product.store_name || "BlueMart Vendor";
  const rating = Number(product.rating || 4);
  const reviews = Number(product.reviews || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || product.discount_price || price);
  const badge = product.badge || "Featured";
  const roundedRating = Math.round(rating);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <motion.article
      className={`product-card card glass-card-rise ${compact ? "compact" : ""}`}
      initial={{ opacity: 0.001, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(30,64,175,0.14)" }}
    >
      <div className="product-image-wrap">
        <Link to={`/product/${product.id}`} className="image-link">
          <motion.img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.35 }}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
        </Link>
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        <span className="product-badge">{badge}</span>
        <motion.button type="button" className="wishlist-btn" onClick={() => onAddWishlist?.(product)} whileTap={{ scale: 0.9 }}>
          <svg viewBox="0 0 24 24" className="wishlist-svg" aria-hidden="true">
            <path d="M12 20s-6.8-4.4-9-8.2C1 8.7 2.3 6 5 6c2 0 3.2 1.1 4 2.3C9.8 7.1 11 6 13 6c2.7 0 4 2.7 2 5.8-2.2 3.8-9 8.2-9 8.2z" />
          </svg>
        </motion.button>
      </div>
      <div className="product-details">
        <p className="product-vendor">{vendor}</p>
        <h4>
          <Link to={`/product/${product.id}`}>{title}</Link>
        </h4>
        <p className="rating">
          <span className="rating-stars-wrap">
            {[1, 2, 3, 4, 5].map((item) => (
              <StarIcon key={item} filled={item <= roundedRating} />
            ))}
          </span>
          <small>({reviews})</small>
        </p>
        <div className="price-row">
          <strong>{formatPrice(price)}</strong>
          {oldPrice > price && <span>{formatPrice(oldPrice)}</span>}
        </div>
        <div className="card-actions">
          <motion.button
            type="button"
            className="primary-btn bluemart-gradient"
            whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(59,130,246,0.45)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart?.(product)}
          >
            Add to Cart
          </motion.button>
          <Link className="ghost-btn" to={`/product/${product.id}`}>
            Quick View
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
