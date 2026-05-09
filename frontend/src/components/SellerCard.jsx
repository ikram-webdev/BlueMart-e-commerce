function SellerCard({ product, onVisitStore }) {
  return (
    <aside className="seller-card card">
      <div className="seller-top">
        <img src={`https://picsum.photos/seed/${product.vendor}/100/100`} alt={product.vendor} />
        <div>
          <h4>{product.vendor}</h4>
          <p>Verified Seller</p>
        </div>
      </div>
      <ul>
        <li><strong>Products:</strong> 240+</li>
        <li><strong>Rating:</strong> 4.8 / 5</li>
        <li><strong>Response:</strong> within 2 hours</li>
      </ul>
      <div className="seller-actions">
        <button type="button" className="primary-btn" onClick={onVisitStore}>Visit Store</button>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => window.open(`mailto:support@bluemart.com?subject=Contact ${encodeURIComponent(product.vendor || "Vendor")}`)}
        >
          Contact Seller
        </button>
      </div>
    </aside>
  );
}

export default SellerCard;
