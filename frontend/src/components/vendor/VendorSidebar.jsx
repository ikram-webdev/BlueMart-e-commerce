import { Link } from "react-router-dom";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "add-product", label: "Add Product" },
  { key: "manage-products", label: "Manage Products" },
  { key: "orders", label: "Orders" },
  { key: "earnings", label: "Earnings" },
  { key: "store-settings", label: "Store Settings" },
  { key: "vendor-profile", label: "Vendor Profile" },
  { key: "logout", label: "Logout" },
];

function VendorSidebar({ activeKey, onSelect, edge = "left" }) {
  const edgeClasses =
    edge === "right"
      ? "border-l border-r-0 border-slate-200 rounded-l-2xl shadow-xl"
      : "border-r border-slate-200";

  return (
    <aside className={`h-full bg-white p-4 ${edgeClasses}`}>
      <Link
        to="/"
        className="mb-3 block rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-sm font-extrabold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <span className="block text-[10px] uppercase tracking-wide text-blue-700/90">Quick Navigation</span>
        <span className="block">← Back to Mart</span>
      </Link>
      <p className="mb-5 text-xl font-bold text-blue-600">BlueMart Vendor</p>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = item.key === activeKey;
          const isLogout = item.key === "logout";
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                isLogout
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default VendorSidebar;
