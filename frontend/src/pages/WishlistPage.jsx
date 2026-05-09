import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useCurrency } from "../context/CurrencyContext";

function WishlistPage() {
  const { formatPrice } = useCurrency();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const result = await api.getWishlist();
      setItems(result.items || []);
      setMessage("");
    } catch (error) {
      setItems([]);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.removeWishlist({ product_id: productId });
      await loadWishlist();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const moveToCart = async (productId) => {
    try {
      await api.addToCart({ product_id: productId, quantity: 1 });
      await api.removeWishlist({ product_id: productId });
      await loadWishlist();
      setMessage("Item moved to cart");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return <main className="container">Loading wishlist...</main>;
  }

  return (
    <main className="container wishlist-page">
      <section className="card section-card">
        <h2>My Wishlist</h2>
        {message && <p className="form-message">{message}</p>}
        {items.length === 0 ? (
          <p>
            Wishlist is empty. <Link to="/products">Browse products</Link>
          </p>
        ) : (
          <div className="wishlist-items-wrap">
            {items.map((item) => (
              <article className="wishlist-item-card" key={item.product_id}>
                <img src={item.thumbnail} alt={item.name} />
                <div className="wishlist-item-info">
                  <h4>{item.name}</h4>
                  <p>{formatPrice(Number(item.discount_price || item.price))}</p>
                </div>
                <div className="wishlist-actions">
                  <button type="button" className="primary-btn" onClick={() => moveToCart(item.product_id)}>
                    Move to Cart
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => removeItem(item.product_id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default WishlistPage;
