function DealSection({ coupons = [] }) {
  return (
    <section className="deals">
      <h3>Flash Deals</h3>
      <div className="coupon-grid">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="coupon card">
            <strong>{coupon.code}</strong>
            <p>{coupon.title}</p>
            <span>{coupon.discount_percent}% OFF</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DealSection;
