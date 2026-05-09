function CategorySidebar({ categories = [] }) {
  return (
    <aside className="hero-category-sidebar card">
      <h3>All Categories</h3>
      <ul>
        {categories.map((category, index) => (
          <li key={category.id}>
            <button type="button" className={index === 0 ? "active" : ""}>
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span>›</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CategorySidebar;
