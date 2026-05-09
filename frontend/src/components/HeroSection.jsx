import { useMemo, useState } from "react";
import CategorySidebar from "./CategorySidebar";

function HeroSection({
  categories,
  heroBanner,
  offers,
  onShopNow,
  onOfferClick,
  onPopularCategoryClick,
}) {
  const banners = useMemo(() => (Array.isArray(heroBanner) ? heroBanner : [heroBanner]), [heroBanner]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = banners[activeIndex] || banners[0];
  const popularTiles = categories.slice(0, 5);
  const onPrevBanner = () => setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const onNextBanner = () => setActiveIndex((prev) => (prev + 1) % banners.length);

  return (
    <section className="hero-shell">
      <div className="hero-grid">
        <CategorySidebar categories={categories} />

        <article className="main-hero card naheed-hero">
          <img src={activeBanner.image} alt={activeBanner.title} />
          <div className="hero-overlay naheed-overlay">
            <p className="hero-chip">Hot Campaign</p>
            <h2>{activeBanner.title}</h2>
            <p>{activeBanner.subtitle}</p>
            <div className="hero-cta-row">
              <button type="button" className="primary-btn" onClick={onShopNow}>Shop Now</button>
            </div>
          </div>
          <button type="button" className="hero-nav prev" aria-label="Previous banner" onClick={onPrevBanner}>‹</button>
          <button type="button" className="hero-nav next" aria-label="Next banner" onClick={onNextBanner}>›</button>
          <div className="hero-dots">
            {banners.map((_, index) => (
              <button
                key={`dot-${index + 1}`}
                type="button"
                className={index === activeIndex ? "active" : ""}
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </article>

        <div className="offer-stack">
          {offers.map((offer) => (
            <article className="offer-card card" key={offer.title}>
              <h4>{offer.title}</h4>
              <p>{offer.description}</p>
              <button type="button" className="offer-link-btn" onClick={onOfferClick}>{offer.cta}</button>
            </article>
          ))}
        </div>
      </div>

      <section className="popular-categories-strip">
        <h3>Popular Categories</h3>
        <div className="popular-categories-grid">
          {popularTiles.map((item) => (
            <button
              type="button"
              className="popular-category-card"
              key={item.id}
              onClick={onPopularCategoryClick}
            >
              <span className="popular-emoji">{item.icon || "🛍"}</span>
              <p>{item.name}</p>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HeroSection;
