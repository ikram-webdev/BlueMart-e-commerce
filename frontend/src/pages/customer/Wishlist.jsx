import DashboardButton from "../../components/dashboard/DashboardButton";
import { formatPkr } from "../../utils/price";

function Wishlist({ items, onRemove, onAddToCart }) {
  return (
    <section className="dashboard-panel">
      <h2>Wishlist</h2>
      <div className="wishlist-grid">
        {items.map((item) => (
          <article key={item.id} className="wishlist-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="wishlist-price">{formatPkr(item.price)}</p>
            <div className="wishlist-actions">
              <DashboardButton className="w-full" onClick={() => onAddToCart(item.id)}>
                Add to Cart
              </DashboardButton>
              <DashboardButton variant="danger" className="w-full" onClick={() => onRemove(item.id)}>
                Remove
              </DashboardButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Wishlist;
