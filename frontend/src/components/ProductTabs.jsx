import { useState } from "react";

const tabList = ["Description", "Specifications", "Reviews", "Shipping & Returns"];

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <section className="product-tabs card">
      <div className="tab-buttons">
        {tabList.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Description" && (
        <div className="tab-content">
          <p>{product.description}</p>
          <ul>
            <li>Premium build and carefully selected materials for long-term durability.</li>
            <li>Optimized performance for daily work, entertainment, and multitasking.</li>
            <li>Designed for comfort, style, and reliable user experience.</li>
            <li>Backed by official warranty and after-sales support.</li>
          </ul>
        </div>
      )}

      {activeTab === "Specifications" && (
        <div className="tab-content">
          <table>
            <tbody>
              <tr><td>Brand</td><td>{product.brand}</td></tr>
              <tr><td>Model</td><td>{product.specifications.Model}</td></tr>
              <tr><td>Category</td><td>{product.category}</td></tr>
              <tr><td>Warranty</td><td>{product.specifications.Warranty}</td></tr>
              <tr><td>Color</td><td>{product.specifications.Color}</td></tr>
              <tr><td>Stock</td><td>{product.stock}</td></tr>
              <tr><td>SKU</td><td>{product.sku}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="tab-content">
          <div className="rating-summary">
            <h4>4.8/5</h4>
            <p>Based on {product.reviews} customer reviews</p>
          </div>
          <div className="review-card">
            <strong>Rafiq A.</strong>
            <p>Excellent quality and fast delivery. Packaging was premium.</p>
          </div>
          <div className="review-card">
            <strong>Mim T.</strong>
            <p>Exactly as described. Great value for the price.</p>
          </div>
          <div className="review-card">
            <strong>Ruhan K.</strong>
            <p>Vendor support was very responsive and helpful.</p>
          </div>
        </div>
      )}

      {activeTab === "Shipping & Returns" && (
        <div className="tab-content">
          <p><strong>Shipping:</strong> Standard delivery within 2-5 business days. Express options available.</p>
          <p><strong>Returns:</strong> Return accepted within 7 days for unused items in original packaging.</p>
          <p><strong>Warranty:</strong> Official brand warranty is applicable as per product policy.</p>
        </div>
      )}
    </section>
  );
}

export default ProductTabs;
