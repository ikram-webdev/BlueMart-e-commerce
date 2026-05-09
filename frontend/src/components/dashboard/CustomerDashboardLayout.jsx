import { useState } from "react";
import DashboardButton from "./DashboardButton";

function CustomerDashboardLayout({ menuItems, activeKey, onSelect, onLogout, children, userName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="customer-dashboard">
      <div className="customer-dashboard-shell">
        <aside className="customer-sidebar">
          <div className="customer-sidebar-top">
            <p className="customer-sidebar-brand">BlueMart</p>
            <button
              type="button"
              className="customer-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>

          <nav className={`customer-sidebar-nav ${mobileMenuOpen ? "open" : ""}`}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`customer-sidebar-link ${activeKey === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <DashboardButton variant="danger" className="customer-logout-btn" onClick={onLogout}>
            Logout
          </DashboardButton>
        </aside>

        <section className="customer-main">
          <header className="customer-main-header">
            <h1>Welcome back, {userName}</h1>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}

export default CustomerDashboardLayout;
