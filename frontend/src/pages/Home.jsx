import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import ScrollReveal from "../components/motion/ScrollReveal";
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton";
import { api } from "../api/client";
import { normalizeProducts } from "../data/products";

const heroSlides = [
  {
    title: "Curated Marketplace",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&h=820&q=80",
  },
  {
    title: "Trusted Sellers",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&h=820&q=80",
  },
  {
    title: "Real-time storefront",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&h=820&q=80",
  },
];

const popularCategories = [
  { id: 1, name: "Gadgets Hub", hint: "Tech-forward picks", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=520&h=340&q=80" },
  { id: 2, name: "Lifestyle Edit", hint: "Everyday comforts", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=520&h=340&q=80" },
  { id: 3, name: "New arrivals", hint: "Just uploaded", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=520&h=340&q=80" },
  { id: 4, name: "Home refresh", hint: "Modern upgrades", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=520&h=340&q=80" },
  { id: 5, name: "Deals today", hint: "Vendor specials", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=520&h=340&q=80" },
  { id: 6, name: "Fashion lane", hint: "Statement pieces", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=520&h=340&q=80" },
];

const curatedBrands = ["BlueVault", "Nimbus", "AeroLab", "Lumen & Co.", "NovaFit", "Harbor"];

function ShelfHeader({ title, onViewAll }) {
  return (
    <div className="naheed-shelf-header">
      <h3>{title}</h3>
      <button type="button" onClick={onViewAll}>
        View All
      </button>
    </div>
  );
}

function Home({ handlers = {} }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const timer = setInterval(fetchProducts, 12000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const showcaseSections = useMemo(
    () => [
      { key: "featured", title: "Featured from vendors", products: products.slice(0, 8) },
      { key: "trending", title: "Momentum picks", products: products.slice(2, 10) },
      { key: "fresh", title: "Just landed", products: products.slice(4, 12) },
    ],
    [products]
  );

  return (
    <main className="home-page naheed-homepage bluemart-home">
      <div className="container naheed-home-wrap">
        <div className="home-float-layer" aria-hidden="true">
          <motion.span className="float-orbit float-a" animate={{ y: [-6, 8, -6], x: [-4, 6, -4] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} />
          <motion.span className="float-orbit float-b" animate={{ y: [10, -6, 10], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }} />
        </div>

        <motion.section
          className="atelier-hero card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.article className="atelier-left-rail" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            {["Featured", "Vendors", "Flash deals", "Top rated", "New", "Pickup ready"].map((item, i) => (
              <motion.button key={item} type="button" onClick={() => navigate("/products")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {item}
              </motion.button>
            ))}
          </motion.article>

          <motion.article className="atelier-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}>
            <p className="atelier-kicker">BlueMart / Hybrid Marketplace</p>
            <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              Elevated shopping for teams, families & creators.
            </motion.h2>
            <p>
              Sellers upload live inventory — you browse a glassy storefront that feels flagship on mobile yet scales to 4K
              workstations.
            </p>
            <div className="atelier-links hero-cta">
              <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="primary-btn bluemart-gradient" onClick={() => navigate("/products")}>
                Explore catalog
              </motion.button>
              <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="ghost-btn" onClick={() => navigate("/signup")}>
                Become a seller
              </motion.button>
            </div>
            <motion.ul
              className="hero-micro-stats"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: "Live sync", value: "Every 12s" },
                { label: "Multi-vendor", value: "Role aware" },
                { label: "Checkout", value: "COD + online" },
              ].map((row) => (
                <motion.li key={row.label} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                  <strong>{row.value}</strong>
                  <span>{row.label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.article>

          <motion.article className="atelier-mosaic" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.08 }}>
            <motion.img layout className="mosaic-a" src={heroSlides[0].image} alt={heroSlides[0].title} whileHover={{ scale: 1.03 }} />
            <motion.img layout className="mosaic-b" src={heroSlides[1].image} alt={heroSlides[1].title} whileHover={{ scale: 1.03 }} />
            <motion.img layout className="mosaic-c" src={heroSlides[2].image} alt={heroSlides[2].title} whileHover={{ scale: 1.03 }} />
            <motion.img
              layout
              className="mosaic-d"
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
              alt="BlueMart marketplace lifestyle"
              whileHover={{ scale: 1.03 }}
            />
          </motion.article>
        </motion.section>

        <ScrollReveal className="naheed-categories reveal-section">
          <h4>Browse moods</h4>
          <div className="naheed-categories-grid">
            {popularCategories.map((item, idx) => (
              <motion.button
                type="button"
                key={item.id}
                className="naheed-category glass-card-rise"
                onClick={() => navigate("/products")}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
              >
                <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                <div className="naheed-category-copy">
                  <span>{item.name}</span>
                  <small>{item.hint}</small>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="naheed-brands reveal-section">
          <div className="naheed-title-row">
            <h4>Featured vendor houses</h4>
            <button type="button" onClick={() => navigate("/products")}>
              Explore
            </button>
          </div>
          <div className="naheed-brand-row">
            {curatedBrands.map((brand, idx) => (
              <motion.button type="button" className="naheed-brand-pill" key={brand} onClick={() => navigate("/products")} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.04 }}>
                {brand}
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="live-feed-callout reveal-section glass-panel">
          <div>
            <p className="live-feed-kicker">Realtime catalog refresh</p>
            <h3>Inventory stays honest — nothing shows unless a vendor publishes it.</h3>
          </div>
          <motion.button type="button" className="primary-btn bluemart-gradient" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/vendor")}>
            Seller console
          </motion.button>
        </ScrollReveal>

        {loading ? (
          <section className="naheed-shelf">
            <ShelfHeader title="Fetching live storefront…" onViewAll={() => navigate("/products")} />
            <ProductGridSkeleton count={8} />
          </section>
        ) : null}

        {!loading && products.length === 0 ? (
          <motion.section className="naheed-shelf empty-shelf-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ShelfHeader title="Your marketplace awaits" onViewAll={() => navigate("/products")} />
            <div className="empty-state-modern">
              <p className="empty-state-title">No live SKUs yet</p>
              <p>Invite admins or onboard vendors — products populate instantly via the realtime feed.</p>
              <motion.button type="button" className="primary-btn bluemart-gradient" whileHover={{ y: -2 }} onClick={() => navigate("/signup")}>
                Vendor onboarding
              </motion.button>
            </div>
          </motion.section>
        ) : null}

        {!loading && products.length > 0
          ? showcaseSections.map((section) => (
              <ScrollReveal className="naheed-shelf" key={section.key}>
                <ShelfHeader title={section.title} onViewAll={() => navigate("/products")} />
                <div className="home-friendly-grid">
                  {section.products.slice(0, 4).map((product, i) => (
                    <motion.div key={`${section.key}-${product.id}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8%" }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                      <ProductCard product={product} onAddToCart={handlers.onAddToCart} onAddWishlist={handlers.onAddWishlist} />
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            ))
          : null}
      </div>
    </main>
  );
}

export default Home;
