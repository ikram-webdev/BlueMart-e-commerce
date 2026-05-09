import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatPkr } from "../../utils/price";

function OrderDetails({ order, loading }) {
  if (!order) {
    return <section className="dashboard-panel">No order selected.</section>;
  }

  const trackingSteps = ["Placed", "Packed", "Shipped", "Delivered"];
  const currentStep = trackingSteps.findIndex((step) => step === order.trackingStage);
  const lineItems = order.items || [];

  return (
    <section className="customer-section">
      <div className="dashboard-panel">
        <div className="panel-row">
          <h2>Order #{order.id}</h2>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="dashboard-panel">
        <h3>Products</h3>
        {loading ? <p className="text-sm text-slate-600">Loading line items…</p> : null}
        {!loading && lineItems.length === 0 ? (
          <p className="text-sm text-slate-600">No products listed for this order.</p>
        ) : null}
        {!loading && lineItems.length > 0 ? (
          <ul className="order-items-list">
            {lineItems.map((item) => (
              <li key={item.id ?? `${item.name}-${item.qty}`}>
                <span>{item.name}</span>
                <span>x{item.qty}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="details-grid">
        <div className="dashboard-panel">
          <h3>Shipping Info</h3>
          <p>{order.shipping.name}</p>
          <p>{order.shipping.address}</p>
          <p>{order.shipping.city}</p>
        </div>
        <div className="dashboard-panel">
          <h3>Payment Info</h3>
          <p>Method: {order.payment.method}</p>
          <p>Status: {order.payment.status}</p>
          <p className="panel-strong">Total: {formatPkr(order.total)}</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <h3>Status Tracking</h3>
        <div className="tracking-grid">
          {trackingSteps.map((step, index) => (
            <div
              key={step}
              className={`tracking-step ${index <= currentStep ? "is-active" : ""}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;
