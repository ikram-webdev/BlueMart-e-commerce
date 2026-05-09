function StoreCard({ store }) {
  return (
    <article className="store-card card">
      <div className="store-header">
        <img src={store.logo} alt={store.name} />
        <div>
          <h4>{store.name}</h4>
          <p>{store.productCount} products</p>
        </div>
      </div>
      <div className="store-thumb-row">
        {store.thumbs.map((thumb) => (
          <img key={thumb} src={thumb} alt={store.name} />
        ))}
      </div>
      <button type="button" className="primary-btn">Visit Store</button>
    </article>
  );
}

export default StoreCard;
