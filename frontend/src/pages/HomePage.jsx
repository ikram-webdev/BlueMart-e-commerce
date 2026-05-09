import { useEffect, useState } from "react";
import { api } from "../api/client";
import CategorySidebar from "../components/CategorySidebar";
import HeroBanner from "../components/HeroBanner";
import DealSection from "../components/DealSection";
import ProductCard from "../components/ProductCard";
import { notify } from "../utils/notify";

function HomePage({ sidebarOpen, onCloseSidebar }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts(),
      api.getAdminBanners().catch(() => ({ banners: [] })),
      api.getAdminCoupons().catch(() => ({ coupons: [] })),
    ]).then(([cat, prd, bnr, cpn]) => {
      setCategories(cat.categories || []);
      setProducts(prd.products || []);
      setBanners(bnr.banners || []);
      setCoupons(cpn.coupons || []);
    });
  }, []);

  const onAddToCart = async (productId) => {
    try {
      await api.addToCart({ product_id: productId, quantity: 1 });
      notify("Added to cart", "success");
    } catch (error) {
      notify(error.message || "Failed to add to cart", "error");
    }
  };

  return (
    <main className="container home-layout">
      <CategorySidebar categories={categories} open={sidebarOpen} onClose={onCloseSidebar} />
      <section>
        <HeroBanner banners={banners} />
        <DealSection coupons={coupons} />
        <section className="section-head"><h3>Featured Products</h3></section>
        <div className="product-grid">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
