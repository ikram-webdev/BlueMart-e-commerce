import { Link } from "react-router-dom";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "users", label: "Users", icon: "users" },
  { key: "vendors", label: "Vendors", icon: "store" },
  { key: "products", label: "Products", icon: "box" },
  { key: "categories", label: "Categories", icon: "grid" },
  { key: "orders", label: "Orders", icon: "receipt" },
  { key: "banners", label: "Banners", icon: "image" },
  { key: "coupons", label: "Deals/Coupons", icon: "ticket" },
  { key: "settings", label: "Settings", icon: "gear" },
  { key: "logout", label: "Logout", icon: "logout" },
];

function MenuIcon({ type }) {
  if (type === "menu") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (type === "home") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
  if (type === "users") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2" /><path d="M3 19a6 6 0 0 1 12 0M14 19a4 4 0 0 1 8 0" /></svg>;
  if (type === "store") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9h18l-1 10H4L3 9Z" /><path d="M6 9V5h12v4" /></svg>;
  if (type === "box") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8l8-4 8 4-8 4-8-4Z" /><path d="M4 8v8l8 4 8-4V8" /></svg>;
  if (type === "grid") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>;
  if (type === "receipt") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></svg>;
  if (type === "image") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 15-4-3-4 4-3-2-4 3" /></svg>;
  if (type === "ticket") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V4H4v4Z" /><path d="M12 7v10" /></svg>;
  if (type === "gear") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" /></svg>;
  if (type === "logout") return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18M12 3v18" /></svg>;
}

function AdminSidebar({ activeKey, onSelect, edge = "left" }) {
  const edgeClasses =
    edge === "right"
      ? "border-l border-blue-900/35 border-r-0 rounded-l-2xl bg-[#0f172a] p-3 text-slate-100 shadow-2xl"
      : "border-r border-blue-900/30 bg-[#0f172a] p-3 text-slate-100";

  return (
    <aside className={`h-full ${edgeClasses}`}>
      <Link
        to="/"
        className="mb-3 flex items-center gap-2 rounded-xl border-2 border-blue-400/80 bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-2 text-left text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400"
      >
        <MenuIcon type="home" />
        <div className="leading-tight">
          <span className="block text-[10px] uppercase tracking-wide text-blue-100/90">Quick Navigation</span>
          <span className="block">Back to Mart</span>
        </div>
      </Link>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xl font-bold text-blue-200">BlueMart Admin</p>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = activeKey === item.key;
          const isLogout = item.key === "logout";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                isLogout
                  ? "bg-red-900/40 text-red-200 hover:bg-red-800/60"
                  : isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-blue-900/45 hover:text-blue-100"
              } flex items-center gap-2 text-left`}
            >
              <MenuIcon type={item.icon} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
