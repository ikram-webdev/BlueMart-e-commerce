import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { api } from "../api/client";

function CartPage() {
  const { formatPrice, region } = useCurrency();
  const [items, setItems] = useState([]);

  const loadCart = () =>
    api
      .getCart()
      .then((res) => {
        setItems(res.items || []);
        window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
      })
      .catch(() => setItems([]));
  useEffect(() => { loadCart(); }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.discount_price || item.price) * item.quantity, 0),
    [items]
  );

  return (
    <main className="container cart-page">
      <section className="card section-card">
        <h2>Shopping Cart</h2>
        <div className="cart-items-wrap">
          {items.map((item) => (
            <article className="cart-item-card" key={item.product_id}>
              <img src={item.thumbnail} alt={item.name} />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>{formatPrice(Number(item.discount_price || item.price))}</p>
                <div className="qty-control">
                  <button type="button" onClick={() => api.updateCart({ product_id: item.product_id, quantity: Math.max(1, item.quantity - 1) }).then(loadCart)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => api.updateCart({ product_id: item.product_id, quantity: item.quantity + 1 }).then(loadCart)}>+</button>
                </div>
              </div>
              <button className="ghost-btn" type="button" onClick={() => api.removeCart({ product_id: item.product_id }).then(loadCart)}>Remove</button>
            </article>
          ))}
        </div>
      </section>

      <aside className="card cart-summary">
        <h3>Order Summary</h3>
        <p className="cart-currency-note">Prices shown in {region.currency} (converted from USD).</p>
        <p>Subtotal: <strong>{formatPrice(total)}</strong></p>
        <p>Shipping: <strong>Free</strong></p>
        <p>Total: <strong>{formatPrice(total)}</strong></p>
        <Link className="primary-btn" to="/checkout">Proceed to Checkout</Link>
      </aside>
    </main>
  );
}

export default CartPage;
