import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Icon({ children, className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ pointerEvents: "none" }}>
      {children}
    </svg>
  );
}

function Header({
  cartCount,
  searchText,
  onSearchTextChange,
  onSearch,
  currentUser,
  onLogout,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}) {
  const location = useLocation();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const categoryItems = ["Electronics", "Fashion & Apparel", "Home & Kitchen", "Deals"];
  const dashboardPath =
    currentUser?.role === "admin" ? "/admin" : currentUser?.role === "vendor" ? "/vendor" : "/customer";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    document.body.classList.add("bluemart-header-active");
    return () => {
      document.body.classList.remove("bluemart-header-active");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const runSearchFromMenu = () => {
    onSearch?.();
    onCloseMenu?.();
  };

  return (
    <>
      <div className={`brand-nav-fixed glass-nav-bar ${navScrolled ? "is-scrolled" : ""}`}>
        <div className={`brand-nav-bar ${navScrolled ? "elevated-nav" : ""}`}>
          <div className="container header-main naheed-shell">
            <Link to="/" className="brand-logo" onClick={onCloseMenu}>
              BlueMart
              <span className="brand-badge">Marketplace</span>
            </Link>

            <div className="category-trigger-wrap desktop-only-trigger">
              <button
                type="button"
                className="category-trigger"
                onClick={() => setCategoryOpen((prev) => !prev)}
                aria-expanded={categoryOpen}
                aria-haspopup="menu"
              >
                <span className="header-inline-icon" aria-hidden="true">
                  <Icon>
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </Icon>
                </span>
                Categories
              </button>
              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    className="category-dropdown glass-panel"
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {categoryItems.map((item) => (
                      <Link
                        key={item}
                        to={`/products?search=${encodeURIComponent(item)}`}
                        onClick={() => setCategoryOpen(false)}
                        role="menuitem"
                      >
                        {item}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="header-search-wrap naheed-search">
              <input
                aria-label="Search products"
                value={searchText}
                onChange={(event) => onSearchTextChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearch();
                }}
                placeholder="Search BlueMart sellers & SKUs..."
                title="Search for products, brands and stores"
              />
              <button type="button" onClick={onSearch}>
                <Icon className="header-inline-icon">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </Icon>
              </button>
            </div>

            <div className="header-actions naheed-actions">
              {currentUser ? (
                <Link className="header-icon-btn account" to={dashboardPath}>
                  <Icon className="header-inline-icon">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5 19a7 7 0 0 1 14 0" />
                  </Icon>
                  {currentUser.name || "My Account"}
                </Link>
              ) : (
                <Link className="header-icon-btn account" to="/auth">
                  <Icon className="header-inline-icon">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5 19a7 7 0 0 1 14 0" />
                  </Icon>
                  Sign In
                </Link>
              )}

              <Link className="header-icon-btn wishlist" to="/wishlist">
                <Icon className="header-inline-icon">
                  <path d="M12 20s-6.8-4.4-9-8.2C1 8.7 2.3 6 5 6c2 0 3.2 1.1 4 2.3C9.8 7.1 11 6 13 6c2.7 0 4 2.7 2 5.8-2.2 3.8-9 8.2-9 8.2z" />
                </Icon>
                Wishlist
              </Link>

              <Link className="header-icon-btn cart-btn" to="/cart">
                <Icon className="header-inline-icon">
                  <circle cx="9" cy="20" r="1.2" />
                  <circle cx="17" cy="20" r="1.2" />
                  <path d="M3 4h2l2.1 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
                </Icon>
                Cart <span className="count-pill">{cartCount}</span>
              </Link>
            </div>

            <div className="mobile-header-controls">
              <Link className="mobile-cart-btn" to="/cart" onClick={onCloseMenu}>
                <Icon className="header-inline-icon">
                  <circle cx="9" cy="20" r="1.2" />
                  <circle cx="17" cy="20" r="1.2" />
                  <path d="M3 4h2l2.1 10.5a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
                </Icon>
                <span className="count-pill">{cartCount}</span>
              </Link>
              <button type="button" className="hamburger-btn" onClick={onToggleMenu} aria-label="Toggle menu">
                <Icon className="header-inline-icon">
                  {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                </Icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <header className="site-header compact-secondary">
        {isHomePage ? (
          <div className="category-links-row">
            <div className="container">
              <motion.nav className="category-links-inline" initial={false}>
                {categoryItems.map((item, idx) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link to={`/products?search=${encodeURIComponent(item)}`}>{item}</Link>
                  </motion.span>
                ))}
              </motion.nav>
            </div>
          </div>
        ) : null}
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMenu}
            />
            <motion.aside
              className="mobile-nav-panel glass-panel"
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
              <div className="mobile-nav-head">
                <div>
                  <p className="mobile-nav-kicker">BlueMart</p>
                  <h2>Navigate</h2>
                </div>
                <button type="button" className="mobile-nav-close" onClick={onCloseMenu}>
                  ✕
                </button>
              </div>

              {currentUser ? (
                <Link
                  className="mobile-nav-dashboard-top primary-btn fluid"
                  to={dashboardPath}
                  onClick={onCloseMenu}
                >
                  Dashboard
                </Link>
              ) : (
                <label className="mobile-nav-search">
                  <Icon className="header-inline-icon">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </Icon>
                  <input
                    value={searchText}
                    onChange={(event) => onSearchTextChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") runSearchFromMenu();
                    }}
                    placeholder="Search marketplace..."
                    aria-label="Search"
                  />
                  <button type="button" className="mini-search-go" onClick={runSearchFromMenu}>
                    Go
                  </button>
                </label>
              )}

              <nav className="mobile-nav-links">
                <Link to="/" onClick={onCloseMenu}>
                  Home
                </Link>
                <Link to="/products" onClick={onCloseMenu}>
                  Shop all
                </Link>
                <Link to="/cart" onClick={onCloseMenu}>
                  Cart
                  <span className="count-pill muted">{cartCount}</span>
                </Link>
                <Link to="/wishlist" className="link-like" onClick={onCloseMenu}>
                  Wishlist
                </Link>
                {!currentUser ? (
                  <Link to="/auth" onClick={onCloseMenu}>
                    Sign in / Register
                  </Link>
                ) : null}
              </nav>

              <div className="mobile-nav-quick">
                {categoryItems.map((item) => (
                  <Link
                    key={item}
                    to={`/products?search=${encodeURIComponent(item)}`}
                    onClick={onCloseMenu}
                    className="chip-link"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              <div className="mobile-nav-meta">
                {currentUser ? (
                  <button
                    type="button"
                    className="ghost-btn ghost-btn-fluid mobile-nav-logout-only"
                    onClick={() => {
                      onLogout?.();
                      onCloseMenu?.();
                    }}
                  >
                    Log out
                  </button>
                ) : (
                  <Link className="primary-btn fluid" to="/auth" onClick={onCloseMenu}>
                    Continue to account
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Header;
