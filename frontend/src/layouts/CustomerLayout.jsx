import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardButton from "../components/dashboard/DashboardButton";
import MobileDashboardDrawer from "../components/dashboard/MobileDashboardDrawer";
import { HamburgerIcon } from "../components/dashboard/MobileNavIcons";

function CustomerSidebarNav({ menuItems, activeKey, onItemSelect }) {
  return (
    <nav className="customer-sidebar-nav">
      {menuItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onItemSelect(item.key)}
          className={`customer-sidebar-link ${activeKey === item.key ? "active" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function CustomerLayout({ menuItems, activeKey, onSelect, onLogout, userName, pageTitle, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (key) => {
    onSelect(key);
    setMobileMenuOpen(false);
  };

  const backBlock = (
    <Link to="/" className="customer-back-link customer-back-link-top" onClick={() => setMobileMenuOpen(false)}>
      <span className="customer-back-kicker">Quick Navigation</span>
      <span className="customer-back-title">← Back to Mart</span>
    </Link>
  );

  const brandOnly = (
    <div className="customer-sidebar-top customer-sidebar-top--brandonly">
      <p className="customer-sidebar-brand">BlueMart</p>
      <span className="customer-sheet-caption">Customer</span>
    </div>
  );

  const logoutBtn = (
    <DashboardButton
      variant="danger"
      className="customer-logout-btn"
      onClick={() => {
        onLogout();
        setMobileMenuOpen(false);
      }}
    >
      Logout
    </DashboardButton>
  );

  return (
    <main className="customer-dashboard">
      <div className="customer-dashboard-shell">
        <header className="customer-mobile-toolbar">
          <Link to="/" className="customer-mobile-toolbar-brand" onClick={() => setMobileMenuOpen(false)}>
            BlueMart
          </Link>
          <button
            type="button"
            className="customer-menu-toggle customer-menu-toggle--icon"
            aria-expanded={mobileMenuOpen}
            aria-controls="customer-mobile-drawer"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <HamburgerIcon className="h-6 w-6" />
          </button>
        </header>

        <aside className="customer-sidebar customer-sidebar-desktop">
          {backBlock}
          {brandOnly}
          <CustomerSidebarNav menuItems={menuItems} activeKey={activeKey} onItemSelect={handleSelect} />
          {logoutBtn}
        </aside>

        <MobileDashboardDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          variant="customer"
        >
          <aside
            id="customer-mobile-drawer"
            className="customer-sidebar customer-sidebar-mobile-sheet customer-sidebar-mobile-sheet--in-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Account menu"
          >
            {backBlock}
            {brandOnly}
            <CustomerSidebarNav menuItems={menuItems} activeKey={activeKey} onItemSelect={handleSelect} />
            {logoutBtn}
          </aside>
        </MobileDashboardDrawer>

        <section className="customer-main">
          <header className="customer-main-header">
            <div>
              <p className="customer-topbar-kicker">Customer Panel</p>
              <h1>{pageTitle || "Dashboard"}</h1>
            </div>
            <div className="customer-user-pill">Hi, {userName}</div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

export default CustomerLayout;
