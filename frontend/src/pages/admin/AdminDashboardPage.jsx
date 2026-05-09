import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiBase } from "../../api/client";
import AdminSidebar from "../../components/admin/AdminSidebar";
import MobileDashboardDrawer from "../../components/dashboard/MobileDashboardDrawer";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminModal from "../../components/admin/AdminModal";
import AdminPagination from "../../components/admin/AdminPagination";

const sectionTitles = {
  dashboard: "Dashboard Overview",
  users: "Manage Users",
  vendors: "Manage Vendors",
  products: "Manage Products",
  categories: "Categories",
  orders: "Orders",
  banners: "Banner Management",
  coupons: "Deals / Coupons",
  settings: "Settings",
};

function DashboardBars({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const width = `${Math.max((item.value / max) * 100, 6)}%`;
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function paginate(items, page, perPage) {
  const totalPages = Math.max(Math.ceil(items.length / perPage), 1);
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (normalizedPage - 1) * perPage;
  return {
    page: normalizedPage,
    totalPages,
    rows: items.slice(start, start + perPage),
  };
}

function AdminDashboardPage() {
  const cardClass = "rounded-xl border border-blue-800/45 bg-blue-950/45 p-5 shadow-sm";
  const formatPkr = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState("");

  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [search, setSearch] = useState("");
  const [pageMap, setPageMap] = useState({
    users: 1,
    vendors: 1,
    products: 1,
    categories: 1,
    orders: 1,
    banners: 1,
    coupons: 1,
  });
  const [productMeta, setProductMeta] = useState({ page: 1, total_pages: 1 });
  const [productFilters, setProductFilters] = useState({ search: "", category: "", vendor: "" });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", discount: "", expiry: "", usage: "" });

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: "", image: "", active: true });

  const [settings, setSettings] = useState({
    siteName: "BlueMart",
    supportEmail: "support@bluemart.local",
    maintenanceMode: false,
  });

  const [productEditModalOpen, setProductEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadDashboardData = useCallback(async (productPage = 1, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(productPage),
        sort: "latest",
      });
      if (productFilters.search) query.set("search", productFilters.search);
      if (productFilters.category) query.set("category_id", productFilters.category);

      const [usersRes, vendorsRes, ordersRes, productsRes, categoriesRes, bannersRes, couponsRes] =
        await Promise.all([
          api.getAdminUsers(),
          api.getAdminVendors(),
          api.getAdminOrders(),
          api.getProducts(`&${query.toString()}`),
          api.getCategories(),
          api.getAdminBanners(),
          api.getAdminCoupons(),
        ]);
      setUsers(usersRes.users || []);
      setVendors(vendorsRes.vendors || []);
      setOrders(ordersRes.orders || []);
      setProducts(productsRes.products || []);
      setCategories(categoriesRes.categories || []);
      setBanners(
        (bannersRes.banners || []).map((item) => ({
          ...item,
          active: item.is_active !== 0,
        }))
      );
      setCoupons(couponsRes.coupons || []);
      setProductMeta(productsRes.meta || { page: 1, total_pages: 1 });
    } catch (error) {
      setFlash(error.message || "Failed to load admin data.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [productFilters.category, productFilters.search]);

  useEffect(() => {
    const raw = localStorage.getItem("bluemart_user");
    if (!raw) {
      navigate("/auth", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user?.role !== "admin") {
        navigate("/", { replace: true });
        return;
      }
      loadDashboardData(1, true);
    } catch (_) {
      navigate("/auth", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, loadDashboardData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData(1, true);
    }, 350);
    return () => clearTimeout(timer);
  }, [productFilters.search, productFilters.category, loadDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadDashboardData(productMeta.page || 1, false);
    }, 7000);
    return () => clearInterval(timer);
  }, [loadDashboardData, productMeta.page]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return [
      { title: "Total Users", value: users.length, subtitle: "Registered customers" },
      { title: "Total Vendors", value: vendors.length, subtitle: "Approved + pending vendors" },
      { title: "Total Orders", value: orders.length, subtitle: "All customer orders" },
      { title: "Revenue", value: formatPkr(revenue), subtitle: "Gross revenue" },
    ];
  }, [orders, users.length, vendors.length]);

  const orderStatusStats = useMemo(() => {
    const map = orders.reduce((acc, item) => {
      const key = (item.status || "pending").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: "Pending", value: map.pending || 0 },
      { label: "Processing", value: map.processing || 0 },
      { label: "Shipped", value: map.shipped || 0 },
      { label: "Delivered", value: map.delivered || 0 },
    ];
  }, [orders]);

  const salesStats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    return [
      { label: "Orders", value: orders.length },
      { label: "Revenue", value: Math.round(total) },
      { label: "Vendors", value: vendors.length },
      { label: "Products", value: products.length },
    ];
  }, [orders, products.length, vendors.length]);

  const handleLogout = async () => {
    try {
      await fetch(`${getApiBase()}/auth/index.php?action=logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // no-op
    }
    localStorage.removeItem("bluemart_user");
    localStorage.removeItem("bluemart_role");
    navigate("/auth", { replace: true });
  };

  const onMenuSelect = (key) => {
    setMobileSidebarOpen(false);
    if (key === "logout") {
      handleLogout();
      return;
    }
    setActiveMenu(key);
    setSearch("");
    setFlash("");
  };

  const filteredUsers = users.filter((item) =>
    `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredVendors = vendors.filter((item) =>
    `${item.store_name} ${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOrders = orders.filter((item) =>
    `${item.id} ${item.customer_name} ${item.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCategories = categories.filter((item) =>
    `${item.name}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBanners = banners.filter((item) => `${item.title || ""}`.toLowerCase().includes(search.toLowerCase()));
  const filteredCoupons = coupons.filter((item) =>
    `${item.code || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const vendorFilteredProducts = products.filter((item) =>
    productFilters.vendor
      ? String(item.store_name || "").toLowerCase().includes(productFilters.vendor.toLowerCase())
      : true
  );

  const usersPage = paginate(filteredUsers, pageMap.users, 8);
  const vendorsPage = paginate(filteredVendors, pageMap.vendors, 8);
  const ordersPage = paginate(filteredOrders, pageMap.orders, 8);
  const categoriesPage = paginate(filteredCategories, pageMap.categories, 8);
  const bannersPage = paginate(filteredBanners, pageMap.banners, 8);
  const couponsPage = paginate(filteredCoupons, pageMap.coupons, 8);
  const productsPage = paginate(vendorFilteredProducts, pageMap.products, 8);

  const setSectionPage = (section, page) => {
    setPageMap((prev) => ({ ...prev, [section]: page }));
  };

  const toggleUserBlock = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)));
    setFlash("User status updated (local).");
  };

  const deleteUser = (id) => {
    if (!window.confirm("Delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setFlash("User removed from table (local).");
  };

  const updateVendorStatus = async (vendorId, status) => {
    try {
      await api.updateAdminVendorStatus({ vendor_id: vendorId, status });
      // Optimistic update + strict numeric comparison for mixed id types.
      setVendors((prev) =>
        prev.map((v) => (Number(v.id) === Number(vendorId) ? { ...v, status } : v))
      );
      // Ensure realtime consistency with backend after update.
      const refreshed = await api.getAdminVendors();
      setVendors(refreshed.vendors || []);
      setFlash("Vendor status updated.");
    } catch (error) {
      setFlash(error.message || "Failed to update vendor status.");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.updateAdminOrderStatus({ id, status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      setFlash("Order status updated.");
    } catch (error) {
      setFlash(error.message || "Failed to update order status.");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.deleteVendorProduct({ id });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFlash("Product deleted.");
    } catch (error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFlash(error.message || "Deleted locally (admin delete endpoint missing).");
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name || "",
      category_id: String(product.category_id || ""),
      price: String(product.price || ""),
      discount_price: String(product.discount_price || ""),
      stock: String(product.stock || ""),
      description: product.description || "",
      thumbnail: product.thumbnail || "",
    });
    setProductEditModalOpen(true);
  };

  const saveProductEdit = async () => {
    try {
      await api.updateVendorProduct({
        id: editingProduct.id,
        category_id: Number(editingProduct.category_id),
        name: editingProduct.name,
        price: Number(editingProduct.price),
        discount_price: editingProduct.discount_price ? Number(editingProduct.discount_price) : null,
        stock: Number(editingProduct.stock),
        description: editingProduct.description,
        thumbnail: editingProduct.thumbnail,
      });
      await loadDashboardData(productMeta.page || 1, false);
      setFlash("Product updated.");
      setProductEditModalOpen(false);
    } catch (error) {
      setFlash(error.message || "Update endpoint may require vendor role.");
    }
  };

  const submitCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      if (editingCategory) {
        await api.updateCategory({ id: editingCategory.id, name: categoryName.trim() });
      } else {
        await api.createCategory({ name: categoryName.trim() });
      }
      await loadDashboardData(productMeta.page || 1, false);
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      setFlash("Category saved.");
    } catch (error) {
      setFlash(error.message || "Category save failed.");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.deleteCategory({ id });
      setCategories((prev) => prev.filter((item) => item.id !== id));
      setFlash("Category deleted.");
    } catch (error) {
      setFlash(error.message || "Failed to delete category.");
    }
  };

  const createBanner = () => {
    const item = { id: Date.now(), title: bannerForm.title, image_url: bannerForm.image, active: bannerForm.active };
    setBanners((prev) => [item, ...prev]);
    setBannerForm({ title: "", image: "", active: true });
    setBannerModalOpen(false);
    setFlash("Banner created locally (backend endpoint not available).");
  };

  const toggleBanner = (id) => {
    setBanners((prev) => prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item)));
  };

  const createCoupon = () => {
    const item = {
      id: Date.now(),
      code: couponForm.code,
      discount_percent: Number(couponForm.discount || 0),
      expires_at: couponForm.expiry,
      usage_limit: Number(couponForm.usage || 0),
    };
    setCoupons((prev) => [item, ...prev]);
    setCouponForm({ code: "", discount: "", expiry: "", usage: "" });
    setCouponModalOpen(false);
    setFlash("Coupon created locally (backend endpoint not available).");
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <AdminStatCard key={item.title} {...item} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-blue-100">Orders Chart</h3>
          <DashboardBars data={orderStatusStats} />
        </section>
        <section className={cardClass}>
          <h3 className="mb-4 text-lg font-semibold text-blue-100">Sales Chart</h3>
          <DashboardBars data={salesStats} />
        </section>
      </div>
    </div>
  );

  const renderUsers = () => (
    <section className={cardClass}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersPage.rows.map((user) => (
              <tr key={user.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{user.name}</td>
                <td className="py-3 pr-3 text-slate-700">{user.email}</td>
                <td className="py-3 pr-3 text-slate-700">{user.role}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-700"
                      onClick={() => toggleUserBlock(user.id)}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={usersPage.page}
        totalPages={usersPage.totalPages}
        onChange={(value) => setSectionPage("users", value)}
      />
    </section>
  );

  const renderVendors = () => (
    <section className={cardClass}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Store</th>
              <th className="py-2 pr-3">Owner</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorsPage.rows.map((vendor) => (
              <tr key={vendor.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{vendor.store_name}</td>
                <td className="py-3 pr-3 text-slate-700">{vendor.name}</td>
                <td className="py-3 pr-3 text-slate-700">{vendor.email}</td>
                <td className="py-3 pr-3 text-slate-700">{vendor.status}</td>
                <td className="py-3">
                  {String(vendor.status).toLowerCase() === "approved" ? (
                    <span className="rounded-full border border-blue-500/50 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
                      Approved
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-blue-300 px-2 py-1 text-xs text-blue-700"
                        onClick={() => updateVendorStatus(vendor.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                        onClick={() => updateVendorStatus(vendor.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={vendorsPage.page}
        totalPages={vendorsPage.totalPages}
        onChange={(value) => setSectionPage("vendors", value)}
      />
    </section>
  );

  const renderProducts = () => (
    <section className={cardClass}>
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <input
          value={productFilters.search}
          onChange={(e) => setProductFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search product"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={productFilters.category}
          onChange={(e) => setProductFilters((prev) => ({ ...prev, category: e.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          value={productFilters.vendor}
          onChange={(e) => setProductFilters((prev) => ({ ...prev, vendor: e.target.value }))}
          placeholder="Filter by vendor name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Vendor</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Stock</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsPage.rows.map((product) => (
              <tr key={product.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{product.name}</td>
                <td className="py-3 pr-3 text-slate-700">{product.category_name}</td>
                <td className="py-3 pr-3 text-slate-700">{product.store_name}</td>
                <td className="py-3 pr-3 text-slate-700">{formatPkr(product.price)}</td>
                <td className="py-3 pr-3 text-slate-700">{product.stock}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => openEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                      onClick={() => removeProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
          disabled={productMeta.page <= 1}
          onClick={() => loadDashboardData(productMeta.page - 1, true)}
        >
          Prev
        </button>
        <span className="text-sm text-slate-600">
          Server Page {productMeta.page} / {Math.max(productMeta.total_pages || 1, 1)}
        </span>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
          disabled={productMeta.page >= (productMeta.total_pages || 1)}
          onClick={() => loadDashboardData(productMeta.page + 1, true)}
        >
          Next
        </button>
      </div>
    </section>
  );

  const renderCategories = () => (
    <section className={cardClass}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setEditingCategory(null);
            setCategoryName("");
            setCategoryModalOpen(true);
          }}
        >
          Add Category
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Slug</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoriesPage.rows.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{item.name}</td>
                <td className="py-3 pr-3 text-slate-700">{item.slug}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => {
                        setEditingCategory(item);
                        setCategoryName(item.name);
                        setCategoryModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
                      onClick={() => deleteCategory(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={categoriesPage.page}
        totalPages={categoriesPage.totalPages}
        onChange={(value) => setSectionPage("categories", value)}
      />
    </section>
  );

  const renderOrders = () => (
    <section className={cardClass}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {ordersPage.rows.map((order) => (
              <tr key={order.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">#{order.id}</td>
                <td className="py-3 pr-3 text-slate-700">{order.customer_name}</td>
                <td className="py-3 pr-3 text-slate-700">{formatPkr(order.total_amount)}</td>
                <td className="py-3 pr-3 text-slate-700">{order.status}</td>
                <td className="py-3">
                  <select
                    value={order.status || "pending"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={ordersPage.page}
        totalPages={ordersPage.totalPages}
        onChange={(value) => setSectionPage("orders", value)}
      />
    </section>
  );

  const renderBanners = () => (
    <section className={cardClass}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => setBannerModalOpen(true)}
        >
          Upload Banner
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Image</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannersPage.rows.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{item.title || `Banner #${item.id}`}</td>
                <td className="py-3 pr-3 text-slate-700">{item.image_url || item.image || "N/A"}</td>
                <td className="py-3 pr-3 text-slate-700">{item.active ? "Active" : "Inactive"}</td>
                <td className="py-3">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => toggleBanner(item.id)}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={bannersPage.page}
        totalPages={bannersPage.totalPages}
        onChange={(value) => setSectionPage("banners", value)}
      />
    </section>
  );

  const renderCoupons = () => (
    <section className={cardClass}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => setCouponModalOpen(true)}
        >
          Create Coupon
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Code</th>
              <th className="py-2 pr-3">Discount</th>
              <th className="py-2 pr-3">Expiry</th>
              <th className="py-2 pr-3">Usage Limit</th>
            </tr>
          </thead>
          <tbody>
            {couponsPage.rows.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">{item.code}</td>
                <td className="py-3 pr-3 text-slate-700">{item.discount_percent || 0}%</td>
                <td className="py-3 pr-3 text-slate-700">{item.expires_at || "-"}</td>
                <td className="py-3 pr-3 text-slate-700">{item.usage_limit || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={couponsPage.page}
        totalPages={couponsPage.totalPages}
        onChange={(value) => setSectionPage("coupons", value)}
      />
    </section>
  );

  const renderSettings = () => (
    <section className={`${cardClass} md:max-w-2xl`}>
      <div className="grid gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Site Name</span>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Support Email</span>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
          />
          Enable maintenance mode
        </label>
        <button
          type="button"
          className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => setFlash("Settings saved locally.")}
        >
          Save Settings
        </button>
      </div>
    </section>
  );

  const renderContent = () => {
    if (activeMenu === "dashboard") return renderDashboard();
    if (activeMenu === "users") return renderUsers();
    if (activeMenu === "vendors") return renderVendors();
    if (activeMenu === "products") return renderProducts();
    if (activeMenu === "categories") return renderCategories();
    if (activeMenu === "orders") return renderOrders();
    if (activeMenu === "banners") return renderBanners();
    if (activeMenu === "coupons") return renderCoupons();
    if (activeMenu === "settings") return renderSettings();
    return renderDashboard();
  };

  return (
    <main className="admin-advanced min-h-screen bg-[#0e1c3d]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] md:grid-cols-[260px_1fr]">
        <div className="hidden md:block">
          <AdminSidebar activeKey={activeMenu} onSelect={onMenuSelect} />
        </div>

        <MobileDashboardDrawer
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          variant="admin"
        >
          <AdminSidebar activeKey={activeMenu} onSelect={onMenuSelect} edge="right" />
        </MobileDashboardDrawer>

        <section className="p-4 text-slate-100 md:p-6">
          <AdminTopbar
            title={sectionTitles[activeMenu]}
            menuOpen={mobileSidebarOpen}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          />

          {(activeMenu !== "dashboard" && activeMenu !== "settings") || activeMenu === "orders" ? (
            <div className="mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${sectionTitles[activeMenu]}`}
                className="w-full rounded-lg border border-blue-700/50 bg-blue-950/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 md:max-w-sm"
              />
            </div>
          ) : null}

          {flash && (
            <div className="mb-4 rounded-lg border border-blue-700/50 bg-blue-900/35 px-3 py-2 text-sm text-blue-100">
              {flash}
            </div>
          )}

          {loading ? (
            <section className="rounded-xl border border-blue-800/50 bg-blue-950/35 p-6 text-sm text-slate-300 shadow-sm">
              Loading admin data...
            </section>
          ) : (
            renderContent()
          )}
        </section>
      </div>

      <AdminModal
        title={editingCategory ? "Edit Category" : "Create Category"}
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        footer={
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={submitCategory}
          >
            Save
          </button>
        }
      >
        <input
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category name"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </AdminModal>

      <AdminModal
        title="Upload Banner"
        open={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        footer={
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={createBanner}
          >
            Save Banner
          </button>
        }
      >
        <div className="grid gap-3">
          <input
            value={bannerForm.title}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Banner title"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={bannerForm.image}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="Image URL"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={bannerForm.active}
              onChange={(e) => setBannerForm((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Active
          </label>
        </div>
      </AdminModal>

      <AdminModal
        title="Create Coupon"
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        footer={
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={createCoupon}
          >
            Save Coupon
          </button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={couponForm.code}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="Code"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={couponForm.discount}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, discount: e.target.value }))}
            placeholder="Discount %"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={couponForm.expiry}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, expiry: e.target.value }))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={couponForm.usage}
            onChange={(e) => setCouponForm((prev) => ({ ...prev, usage: e.target.value }))}
            placeholder="Usage limit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </AdminModal>

      <AdminModal
        title="Edit Product"
        open={productEditModalOpen}
        onClose={() => setProductEditModalOpen(false)}
        footer={
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={saveProductEdit}
          >
            Save Changes
          </button>
        }
      >
        {editingProduct ? (
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={editingProduct.name}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={editingProduct.category_id}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, category_id: e.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price (PKR)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={editingProduct.discount_price}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, discount_price: e.target.value }))}
              placeholder="Offer price (Optional, PKR)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="md:col-span-2 -mt-1 text-xs text-slate-500">
              Tip: Leave offer price empty if product has no discount. Use PKR values only.
            </p>
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, stock: e.target.value }))}
              placeholder="Stock"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={editingProduct.thumbnail}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, thumbnail: e.target.value }))}
              placeholder="Thumbnail URL"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows="3"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        ) : null}
      </AdminModal>
    </main>
  );
}

export default AdminDashboardPage;
