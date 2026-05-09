import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";

function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1 });
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    const page = Number(searchParams.get("page") || 1);
    const categoryId = searchParams.get("category_id");
    const query = `&page=${page}&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ""}${
      categoryId ? `&category_id=${categoryId}` : ""
    }`;
    const result = await api.getProducts(query);
    setProducts(result.products || []);
    setMeta(result.meta || { page: 1, total_pages: 1 });
  };

  useEffect(() => { fetchProducts(); }, [searchParams, sort]);

  const addToCart = async (product) => {
    try {
      await api.addToCart({ product_id: Number(product.id), quantity: 1 });
      setMessage("Added to cart");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const addToWishlist = async (product) => {
    try {
      await api.addWishlist({ product_id: Number(product.id) });
      setMessage("Added to wishlist");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="container">
      <div className="toolbar card">
        <input placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={fetchProducts}>Search</button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
      {message && <p className="form-message">{message}</p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            onAddWishlist={addToWishlist}
          />
        ))}
      </div>
      <div className="pager">
        <button disabled={meta.page <= 1} onClick={() => setSearchParams({ page: String(meta.page - 1) })}>Prev</button>
        <span>{meta.page} / {meta.total_pages}</span>
        <button disabled={meta.page >= meta.total_pages} onClick={() => setSearchParams({ page: String(meta.page + 1) })}>Next</button>
      </div>
    </main>
  );
}

export default ProductListingPage;
