import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton";
import { api } from "../api/client";
import { getProductBrands, getProductCategories, normalizeProducts } from "../data/products";

const PAGE_SIZE = 8;

function Products({ handlers }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [minRating, setMinRating] = useState(2);
  const [availability, setAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState(500000);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts();
        if (!mounted) return;
        setProducts(normalizeProducts(res.products || []));
      } catch (_error) {
        if (!mounted) return;
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    const timer = setInterval(fetchProducts, 6000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = products
      .filter((item) => selectedCategory === "All" || item.category === selectedCategory)
      .filter((item) => selectedBrand === "All" || item.brand === selectedBrand)
      .filter((item) => item.rating >= minRating)
      .filter((item) => item.price <= priceRange)
      .filter((item) => (availability === "in_stock" ? item.stock > 0 : true))
      .filter((item) => {
        if (!normalizedSearch) return true;
        return [item.title, item.category, item.vendor].some((field) =>
          field.toLowerCase().includes(normalizedSearch)
        );
      });

    if (sortBy === "price_low_high") return [...base].sort((a, b) => a.price - b.price);
    if (sortBy === "price_high_low") return [...base].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") return [...base].sort((a, b) => b.rating - a.rating);
    return [...base].sort((a, b) => b.id - a.id);
  }, [availability, minRating, priceRange, products, search, selectedBrand, selectedCategory, sortBy]);

  const productCategories = useMemo(() => getProductCategories(products), [products]);
  const productBrands = useMemo(() => getProductBrands(products), [products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === "category") setSelectedCategory(value);
    if (key === "brand") setSelectedBrand(value);
    if (key === "minRating") setMinRating(value);
    if (key === "availability") setAvailability(value);
    if (key === "priceRange") setPriceRange(value);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setMinRating(2);
    setAvailability("all");
    setPriceRange(500000);
    setSearch("");
    setSortBy("latest");
    setPage(1);
  };

  return (
    <main className="products-page container">
      <section className="products-banner card products-banner-advanced">
        <div>
          <p className="products-banner-kicker">BlueMart Collection</p>
          <h2>Discover Refined Marketplace Picks</h2>
          <p>Explore curated products, trusted vendors, and premium daily offers in one clean experience.</p>
        </div>
        <div className="products-banner-chips">
          <span>Secure Checkout</span>
          <span>Fast Delivery</span>
          <span>Top Rated Vendors</span>
        </div>
      </section>

      <div className="products-layout">
        <div className={`filter-drawer ${showFilters ? "open" : ""}`}>
          <FilterSidebar
            categories={productCategories}
            brands={productBrands}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            minRating={minRating}
            availability={availability}
            priceRange={priceRange}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        <section className="products-content">
          <div className="products-toolbar card products-toolbar-advanced">
            <button type="button" className="ghost-btn mobile-only" onClick={() => setShowFilters((prev) => !prev)}>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, vendor, category..."
            />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Latest</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="view-toggle">
              <button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>Grid</button>
              <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>List</button>
            </div>
          </div>

          <p className="result-count">
            {loading ? "Loading products..." : `${filteredProducts.length} products found`}
          </p>

          {loading ? <ProductGridSkeleton count={PAGE_SIZE} /> : null}

          {!loading && filteredProducts.length === 0 ? (
            <motion.section className="card section-card empty-catalog-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3>No products available yet</h3>
              <p>BlueMart hides empty shelves until a vendor publishes inventory. Dashboard users can publish in seconds.</p>
            </motion.section>
          ) : null}

          {!loading && filteredProducts.length > 0 ? (
            <div className={`product-grid ${viewMode === "grid" ? "four-cols" : "list-cols"}`}>
              {pageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handlers.onAddToCart}
                  onAddWishlist={handlers.onAddWishlist}
                />
              ))}
            </div>
          ) : null}

          <div className="pagination">
            <button type="button" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Products;
