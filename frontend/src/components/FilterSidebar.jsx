import { formatPkr } from "../utils/price";

function FilterSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  minRating,
  availability,
  priceRange,
  onChange,
  onReset
}) {
  return (
    <aside className="filter-sidebar card">
      <div className="filter-title-row">
        <h3>Filters</h3>
        <button type="button" onClick={onReset}>Reset</button>
      </div>

      <div className="filter-group">
        <h4>Categories</h4>
        {categories.map((category) => (
          <label key={category}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === category}
              onChange={() => onChange("category", category)}
            />
            {category}
          </label>
        ))}
        <label>
          <input
            type="radio"
            name="category"
            checked={selectedCategory === "All"}
            onChange={() => onChange("category", "All")}
          />
          All
        </label>
      </div>

      <div className="filter-group">
        <h4>Price Range</h4>
        <input
          type="range"
          min="100"
          max="500000"
          step="1000"
          value={priceRange}
          onChange={(event) => onChange("priceRange", Number(event.target.value))}
        />
        <p>Up to {formatPkr(priceRange)}</p>
      </div>

      <div className="filter-group">
        <h4>Rating</h4>
        {[4, 3, 2].map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="rating"
              checked={minRating === value}
              onChange={() => onChange("minRating", value)}
            />
            {value}+ rating & above
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Brand</h4>
        <select value={selectedBrand} onChange={(event) => onChange("brand", event.target.value)}>
          <option value="All">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h4>Availability</h4>
        <label>
          <input
            type="radio"
            name="availability"
            checked={availability === "all"}
            onChange={() => onChange("availability", "all")}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="availability"
            checked={availability === "in_stock"}
            onChange={() => onChange("availability", "in_stock")}
          />
          In Stock
        </label>
      </div>
    </aside>
  );
}

export default FilterSidebar;
