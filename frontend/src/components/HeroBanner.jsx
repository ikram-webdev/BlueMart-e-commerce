function HeroBanner({ banners = [] }) {
  const first = banners[0] || {
    title: "Marketplace Deals",
    subtitle: "Trusted vendors and best prices.",
    image_path: "https://via.placeholder.com/960x320?text=Marketplace+Banner",
  };

  return (
    <section className="hero-banner card">
      <img src={first.image_path} alt={first.title} />
      <div className="hero-content">
        <h2>{first.title}</h2>
        <p>{first.subtitle}</p>
      </div>
    </section>
  );
}

export default HeroBanner;
