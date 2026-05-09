import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { notify } from "../utils/notify";
import { formatPkr } from "../utils/price";

function CheckoutPage() {
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem || null;
  const isBuyNowMode = Boolean(buyNowItem?.product_id);
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedGateway, setSelectedGateway] = useState("jazzcash");
  const [paymentForm, setPaymentForm] = useState({
    jazzcash_mobile: "",
    jazzcash_cnic: "",
    easypaisa_mobile: "",
    easypaisa_cnic: "",
    card_name: "",
    card_number: "",
    card_expiry: "",
    card_cvv: "",
    bank_name: "",
  });
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isBuyNowMode) {
      setLoading(false);
      setItems([
        {
          product_id: buyNowItem.product_id,
          name: buyNowItem.name,
          thumbnail: buyNowItem.thumbnail,
          quantity: buyNowItem.quantity,
          price: buyNowItem.unit_price,
          discount_price: buyNowItem.unit_price,
        },
      ]);
      return () => {};
    }

    let mounted = true;
    const loadCart = async () => {
      try {
        const result = await api.getCart();
        if (!mounted) return;
        setItems(result.items || []);
      } catch (_error) {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCart();
    return () => {
      mounted = false;
    };
  }, [buyNowItem, isBuyNowMode]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.discount_price || item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );
  const shipping = items.length > 0 ? 0 : 0;
  const total = subtotal + shipping;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        payment_method: paymentMethod,
        ...(paymentMethod === "online"
          ? { ...paymentForm, payment_gateway: selectedGateway }
          : {}),
      };
      const result = isBuyNowMode
        ? await api.placeDirectOrder({
            ...payload,
            product_id: Number(buyNowItem.product_id),
            quantity: Number(buyNowItem.quantity || 1),
          })
        : await api.placeOrder(payload);
      setMessage(`Order placed. ID: ${result.order_id}`);
      setOrderId(result.order_id);
      notify(`Order placed successfully (#${result.order_id})`, "success");
      if (!isBuyNowMode) {
        window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
      }
      if (!isBuyNowMode) {
        setItems([]);
      }
      setForm({
        customer_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
      });
      setPaymentForm({
        jazzcash_mobile: "",
        jazzcash_cnic: "",
        easypaisa_mobile: "",
        easypaisa_cnic: "",
        card_name: "",
        card_number: "",
        card_expiry: "",
        card_cvv: "",
        bank_name: "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container checkout-page checkout-page-advanced">
      <section className="card checkout-main-card">
        <div className="checkout-headline">
          <p className="checkout-kicker">BlueMart Secure Checkout</p>
          <h2>Complete Your Order</h2>
          <p>Enter your delivery details and place order with Cash on Delivery.</p>
        </div>

        <div className="checkout-grid">
          <form className="checkout-form-advanced" onSubmit={submit}>
            <div className="checkout-form-row two-col">
              <label>
                <span>Customer Name</span>
                <input
                  placeholder="Enter full name"
                  value={form.customer_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="checkout-form-row two-col">
              <label>
                <span>Phone</span>
                <input
                  placeholder="03xx-xxxxxxx"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </label>
              <label>
                <span>City</span>
                <input
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="checkout-form-row">
              <label>
                <span>Address</span>
                <textarea
                  rows="3"
                  placeholder="House no, street, area"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="checkout-payment-selector">
              <button
                type="button"
                className={paymentMethod === "cod" ? "active" : ""}
                onClick={() => setPaymentMethod("cod")}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                className={paymentMethod === "online" ? "active" : ""}
                onClick={() => {
                  setPaymentMethod("online");
                }}
              >
                Online Payment
              </button>
            </div>

            {paymentMethod === "online" ? (
              <div className="checkout-online-box">
                <h4>Choose Pakistani Gateway</h4>
                <div className="checkout-gateway-options">
                  {[
                    { id: "jazzcash", label: "JazzCash" },
                    { id: "easypaisa", label: "Easypaisa" },
                    { id: "bank_card", label: "Bank Card" },
                  ].map((gateway) => (
                    <button
                      key={gateway.id}
                      type="button"
                      className={selectedGateway === gateway.id ? "active" : ""}
                      onClick={() => setSelectedGateway(gateway.id)}
                    >
                      {gateway.label}
                    </button>
                  ))}
                </div>
                <p className="checkout-summary-sub">
                  Selected:{" "}
                  <strong>
                    {selectedGateway === "jazzcash"
                      ? "JazzCash"
                      : selectedGateway === "easypaisa"
                      ? "Easypaisa"
                      : "Bank Card"}
                  </strong>
                </p>
                <h4>Payment Details</h4>
                {selectedGateway === "jazzcash" ? (
                  <div className="checkout-form-row two-col">
                    <label>
                      <span>JazzCash Mobile Number</span>
                      <input
                        placeholder="03xx-xxxxxxx"
                        value={paymentForm.jazzcash_mobile}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, jazzcash_mobile: e.target.value }))}
                        required={paymentMethod === "online" && selectedGateway === "jazzcash"}
                      />
                    </label>
                    <label>
                      <span>CNIC (without dashes)</span>
                      <input
                        placeholder="3520212345671"
                        value={paymentForm.jazzcash_cnic}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, jazzcash_cnic: e.target.value }))}
                        required={paymentMethod === "online" && selectedGateway === "jazzcash"}
                      />
                    </label>
                  </div>
                ) : null}

                {selectedGateway === "easypaisa" ? (
                  <div className="checkout-form-row two-col">
                    <label>
                      <span>Easypaisa Account Number</span>
                      <input
                        placeholder="03xx-xxxxxxx"
                        value={paymentForm.easypaisa_mobile}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, easypaisa_mobile: e.target.value }))}
                        required={paymentMethod === "online" && selectedGateway === "easypaisa"}
                      />
                    </label>
                    <label>
                      <span>CNIC (without dashes)</span>
                      <input
                        placeholder="3520212345671"
                        value={paymentForm.easypaisa_cnic}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, easypaisa_cnic: e.target.value }))}
                        required={paymentMethod === "online" && selectedGateway === "easypaisa"}
                      />
                    </label>
                  </div>
                ) : null}

                {selectedGateway === "bank_card" ? (
                  <>
                    <div className="checkout-form-row two-col">
                      <label>
                        <span>Bank Name</span>
                        <input
                          placeholder="HBL / Meezan / UBL"
                          value={paymentForm.bank_name}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                          required={paymentMethod === "online" && selectedGateway === "bank_card"}
                        />
                      </label>
                      <label>
                        <span>Card Holder Name</span>
                        <input
                          placeholder="Name on card"
                          value={paymentForm.card_name}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, card_name: e.target.value }))}
                          required={paymentMethod === "online" && selectedGateway === "bank_card"}
                        />
                      </label>
                    </div>
                    <div className="checkout-form-row two-col">
                      <label>
                        <span>Card Number</span>
                        <input
                          placeholder="4111 1111 1111 1111"
                          value={paymentForm.card_number}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, card_number: e.target.value }))}
                          required={paymentMethod === "online" && selectedGateway === "bank_card"}
                        />
                      </label>
                      <label>
                        <span>Expiry / CVV</span>
                        <div className="checkout-inline-split">
                          <input
                            placeholder="MM/YY"
                            value={paymentForm.card_expiry}
                            onChange={(e) => setPaymentForm((prev) => ({ ...prev, card_expiry: e.target.value }))}
                            required={paymentMethod === "online" && selectedGateway === "bank_card"}
                          />
                          <input
                            placeholder="CVV"
                            value={paymentForm.card_cvv}
                            onChange={(e) => setPaymentForm((prev) => ({ ...prev, card_cvv: e.target.value }))}
                            required={paymentMethod === "online" && selectedGateway === "bank_card"}
                          />
                        </div>
                      </label>
                    </div>
                  </>
                ) : null}
              </div>
            ) : <div className="checkout-payment-chip">Payment Method: Cash on Delivery</div>}
            <button type="submit" className="primary-btn" disabled={submitting || items.length === 0}>
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
            {message && <p className="form-message">{message}</p>}
            {orderId ? (
              <div className="checkout-confirm-box">
                <h4>Order Confirmed</h4>
                <p>Your order #{orderId} is confirmed and sent to vendor/customer notifications.</p>
                <Link className="ghost-btn" to="/customer">Go to Customer Dashboard</Link>
              </div>
            ) : null}
          </form>

          <aside className="checkout-summary">
            <h3>Order Summary</h3>
            <p className="checkout-summary-sub">
              {loading ? "Loading cart..." : items.length ? `${items.length} item(s) in cart` : "Your cart is empty"}
            </p>
            <div className="checkout-summary-list">
              {items.slice(0, 4).map((item) => (
                <article key={item.product_id} className="checkout-summary-item">
                  <img src={item.thumbnail} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <small>Qty: {item.quantity}</small>
                  </div>
                  <strong>{formatPkr(Number(item.discount_price || item.price || 0) * Number(item.quantity || 0))}</strong>
                </article>
              ))}
            </div>

            <div className="checkout-totals">
              <p><span>Subtotal</span><strong>{formatPkr(subtotal)}</strong></p>
              <p><span>Shipping</span><strong>{shipping === 0 ? "Free" : formatPkr(shipping)}</strong></p>
              <p className="grand-total"><span>Total</span><strong>{formatPkr(total)}</strong></p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default CheckoutPage;
