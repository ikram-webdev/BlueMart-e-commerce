import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getApiBase } from "../../api/client";
import VendorSidebar from "../../components/vendor/VendorSidebar";
import MobileDashboardDrawer from "../../components/dashboard/MobileDashboardDrawer";
import { HamburgerIcon } from "../../components/dashboard/MobileNavIcons";
import StatsCard from "../../components/vendor/StatsCard";
import SectionCard from "../../components/vendor/SectionCard";
import SimpleBarChart from "../../components/vendor/SimpleBarChart";

const initialProductForm = {
  productName: "",
  category: "",
  price: "",
  discountPrice: "",
  stock: "",
  description: "",
};

function VendorDashboardPage() {
  const navigate = useNavigate();
  const formatPkr = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [productErrors, setProductErrors] = useState({});
  const [productImagePreview, setProductImagePreview] = useState("");
  const [productImageName, setProductImageName] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);
  const previewObjectUrlRef = useRef(null);
  const [message, setMessage] = useState("");
  const [storeForm, setStoreForm] = useState({
    storeName: "BlueMart Tech Store",
    description: "Trusted gadgets and accessories for daily life.",
    logo: "",
  });
  const [profileForm, setProfileForm] = useState({
    fullName: "Test Vendor",
    email: "vendor@bluemart.com",
    phone: "+92 300 1234567",
  });

  useEffect(() => {
    const raw = localStorage.getItem("bluemart_user");
    if (!raw) {
      navigate("/auth", { replace: true });
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user?.role !== "vendor") {
        navigate("/", { replace: true });
      }
    } catch (_) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [productsRes, ordersRes, categoriesRes, profileRes] = await Promise.all([
        api.getVendorProducts(),
        api.getVendorOrders(),
        api.getCategories(),
        api.getVendorProfile(),
      ]);
      setProducts(productsRes.products || []);
      setOrders(ordersRes.orders || []);
      setCategories(categoriesRes.categories || []);

      const vendor = profileRes.vendor || {};
      const user = JSON.parse(localStorage.getItem("bluemart_user") || "{}");
      setStoreForm((prev) => ({
        ...prev,
        storeName: vendor.store_name || prev.storeName,
        description: vendor.description || prev.description,
      }));
      setProfileForm((prev) => ({
        ...prev,
        fullName: vendor.name || user.name || prev.fullName,
        email: vendor.email || user.email || prev.email,
        phone: vendor.phone || user.phone || prev.phone,
      }));
    } catch (error) {
      setMessage(error.message || "Failed to load vendor data.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const timer = setInterval(() => loadData(false), 7000);
    return () => clearInterval(timer);
  }, [loadData]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => {
      const total = Number(order.total_amount || order.total || 0);
      const qty = Number(order.quantity || 1);
      return sum + (Number.isFinite(total) && total > 0 ? total : Number(order.unit_price || 0) * qty);
    }, 0);
    return [
      { title: "Total Products", value: products.length, subtitle: "Active listings", icon: "📦" },
      { title: "Total Orders", value: orders.length, subtitle: "All order records", icon: "🧾" },
      { title: "Revenue", value: formatPkr(revenue), subtitle: "Total collected", icon: "💰" },
    ];
  }, [orders, products]);

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 4; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString("en-US", { month: "short" });
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push({ label, key, value: 0 });
    }

    const totalsByMonth = orders.reduce((acc, order) => {
      const rawDate = order.created_at || order.date;
      const amount = Number(order.total_amount || order.unit_price || 0);
      if (!rawDate || !Number.isFinite(amount)) return acc;
      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) return acc;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + amount;
      return acc;
    }, {});

    return months.map((item) => ({
      label: item.label,
      value: totalsByMonth[item.key] || 0,
    }));
  }, [orders]);

  const totalEarnings = useMemo(
    () => monthlyEarnings.reduce((sum, item) => sum + item.value, 0),
    [monthlyEarnings]
  );

  const handleMenuSelect = async (key) => {
    setMobileSidebarOpen(false);
    if (key !== "logout") {
      setActivePage(key);
      setMessage("");
      return;
    }

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

  const setProductField = (name, value) => {
    setProductForm((prev) => ({ ...prev, [name]: value }));
    setProductErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onPickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProductImagePreview("");
      setProductImageName("");
      setProductImageFile(null);
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setProductImagePreview(objectUrl);
    setProductImageName(file.name);
    setProductImageFile(file);
  };

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const resetProductImageState = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setProductImagePreview("");
    setProductImageName("");
    setProductImageFile(null);
  };

  const maybeUploadProductImage = async (productId) => {
    if (!productImageFile || !productId) return;
    const uploadRes = await api.uploadVendorProductImage({ productId, file: productImageFile });
    if (uploadRes?.image_path) {
      setProductImagePreview(uploadRes.image_path);
      setProductImageName(productImageName || "Uploaded image");
    }
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productForm.productName.trim()) errors.productName = "Product name is required";
    if (!productForm.category.trim()) errors.category = "Category is required";
    if (!productForm.price || Number(productForm.price) <= 0) errors.price = "Enter a valid price";
    if (productForm.discountPrice && Number(productForm.discountPrice) >= Number(productForm.price || 0)) {
      errors.discountPrice = "Discount must be less than price";
    }
    if (!productForm.stock || Number(productForm.stock) < 0) errors.stock = "Enter valid stock quantity";
    if (!productForm.description.trim()) errors.description = "Description is required";
    return errors;
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    const errors = validateProductForm();
    setProductErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      const payload = {
        category_id: Number(productForm.category),
        name: productForm.productName.trim(),
        price: Number(productForm.price),
        discount_price: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stock: Number(productForm.stock),
        description: productForm.description.trim(),
        thumbnail: editingProductId ? productImagePreview || undefined : undefined,
      };
      if (editingProductId) {
        await api.updateVendorProduct({ id: editingProductId, ...payload });
        await maybeUploadProductImage(editingProductId);
        setMessage("Product updated successfully.");
      } else {
        const created = await api.createVendorProduct(payload);
        await maybeUploadProductImage(Number(created.product_id || 0));
        setMessage("Product added successfully.");
      }
      await loadData(false);
      setProductForm(initialProductForm);
      resetProductImageState();
      setEditingProductId(null);
      setActivePage("manage-products");
    } catch (error) {
      setMessage(error.message || "Failed to save product.");
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(Number(product.id));
    setProductForm({
      productName: product.name || "",
      category: String(product.category_id || ""),
      price: String(product.price || ""),
      discountPrice: product.discount_price ? String(product.discount_price) : "",
      stock: String(product.stock ?? ""),
      description: product.description || "",
    });
    setProductImagePreview(product.thumbnail || "");
    setProductImageName(product.thumbnail ? "Current product image" : "");
    setProductImageFile(null);
    setActivePage("add-product");
  };

  const removeProduct = async (id) => {
    try {
      await api.deleteVendorProduct({ id: Number(id) });
      setProducts((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
      setMessage("Product deleted.");
    } catch (error) {
      setMessage(error.message || "Failed to delete product.");
    }
  };

  const onOrderStatusChange = (id, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        String(order.id) === String(id) || String(order.order_id) === String(id)
          ? { ...order, status }
          : order
      )
    );
  };

  const renderDashboardHome = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Orders">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order, index) => (
                  <tr key={`${order.id}-${index}`} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">#{order.id}</td>
                    <td className="py-3 pr-4 text-slate-600">{order.customer_name || "Customer"}</td>
                    <td className="py-3 pr-4 text-slate-600">{order.status || "pending"}</td>
                    <td className="py-3 font-semibold text-slate-800">
                      {formatPkr(order.total_amount || order.unit_price || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Monthly Earnings">
          <SimpleBarChart data={monthlyEarnings} />
        </SectionCard>
      </div>
    </div>
  );

  const renderAddProduct = () => (
    <SectionCard title="Add Product">
      <form onSubmit={submitProduct} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Product Name</span>
          <input
            value={productForm.productName}
            onChange={(e) => setProductField("productName", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          />
          {productErrors.productName && <p className="mt-1 text-xs text-red-600">{productErrors.productName}</p>}
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Category</span>
          <select
            value={productForm.category}
            onChange={(e) => setProductField("category", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {productErrors.category && <p className="mt-1 text-xs text-red-600">{productErrors.category}</p>}
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Price (PKR)</span>
          <input
            type="number"
            value={productForm.price}
            onChange={(e) => setProductField("price", e.target.value)}
            placeholder="e.g. 25000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          />
          <p className="mt-1 text-xs text-slate-500">Enter final base amount in PKR.</p>
          {productErrors.price && <p className="mt-1 text-xs text-red-600">{productErrors.price}</p>}
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Offer Price (Optional, PKR)</span>
          <input
            type="number"
            value={productForm.discountPrice}
            onChange={(e) => setProductField("discountPrice", e.target.value)}
            placeholder="Leave empty if no offer"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          />
          <p className="mt-1 text-xs text-slate-500">Set lower PKR amount to apply OFF offer badge.</p>
          {productErrors.discountPrice && (
            <p className="mt-1 text-xs text-red-600">{productErrors.discountPrice}</p>
          )}
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Stock</span>
          <input
            type="number"
            value={productForm.stock}
            onChange={(e) => setProductField("stock", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          />
          {productErrors.stock && <p className="mt-1 text-xs text-red-600">{productErrors.stock}</p>}
        </label>

        <div className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Upload Images</span>
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-4 transition hover:border-blue-400 hover:bg-blue-50">
            <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">Choose product image</p>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP - best for product cards</p>
              </div>
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Browse
              </span>
            </div>
            <p className="mt-3 truncate text-xs text-blue-700">
              {productImageName || "No image selected yet"}
            </p>
          </label>
        </div>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Description</span>
          <textarea
            rows="4"
            value={productForm.description}
            onChange={(e) => setProductField("description", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
          />
          {productErrors.description && <p className="mt-1 text-xs text-red-600">{productErrors.description}</p>}
        </label>

        {productImagePreview && (
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Image Preview</p>
            <img src={productImagePreview} alt="Selected product" className="h-28 rounded-xl object-cover" />
          </div>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {editingProductId ? "Update Product" : "Submit Product"}
          </button>
          {editingProductId && (
            <button
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setProductForm(initialProductForm);
                resetProductImageState();
              }}
              className="ml-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </SectionCard>
  );

  const renderManageProducts = () => (
    <SectionCard title="Manage Products">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Image</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Stock</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100">
                <td className="py-3 pr-3">
                  <img
                    src={product.thumbnail || product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                </td>
                <td className="py-3 pr-3 font-medium text-slate-800">{product.name}</td>
                <td className="py-3 pr-3 text-slate-700">
                  {formatPkr(product.discount_price || product.price || 0)}
                </td>
                <td className="py-3 pr-3 text-slate-700">{product.stock}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      onClick={() => startEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"
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
    </SectionCard>
  );

  const renderOrders = () => (
    <SectionCard title="Orders">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-3">Order ID</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={`${order.id}-${index}`} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-medium text-slate-800">#{order.id}</td>
                <td className="py-3 pr-3 text-slate-700">{order.customer_name || "Customer"}</td>
                <td className="py-3 pr-3 text-slate-700">{order.status || "pending"}</td>
                <td className="py-3 pr-3 font-semibold text-slate-800">
                  {formatPkr(order.total_amount || order.unit_price || 0)}
                </td>
                <td className="py-3">
                  <select
                    value={order.status || "pending"}
                    onChange={(e) => onOrderStatusChange(order.id, e.target.value)}
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
    </SectionCard>
  );

  const renderEarnings = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Total Earnings">
        <p className="text-3xl font-bold text-blue-600">{formatPkr(totalEarnings)}</p>
        <p className="mt-2 text-sm text-slate-500">Combined earnings from monthly sales.</p>
      </SectionCard>
      <SectionCard title="Monthly Breakdown">
        <SimpleBarChart data={monthlyEarnings} />
      </SectionCard>
    </div>
  );

  const renderStoreSettings = () => (
    <SectionCard title="Store Settings">
      <form className="grid gap-4 md:max-w-2xl">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Store Name</span>
          <input
            value={storeForm.storeName}
            onChange={(e) => setStoreForm((prev) => ({ ...prev, storeName: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Logo Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setStoreForm((prev) => ({ ...prev, logo: e.target.files?.[0]?.name || "" }))}
            className="w-full text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Description</span>
          <textarea
            rows="4"
            value={storeForm.description}
            onChange={(e) => setStoreForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button type="button" className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">
          Save Settings
        </button>
      </form>
    </SectionCard>
  );

  const renderVendorProfile = () => (
    <SectionCard title="Vendor Profile">
      <form className="grid gap-4 md:max-w-2xl">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Full Name</span>
          <input
            value={profileForm.fullName}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone</span>
          <input
            value={profileForm.phone}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button type="button" className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">
          Update Profile
        </button>
      </form>
    </SectionCard>
  );

  const renderContent = () => {
    if (activePage === "dashboard") return renderDashboardHome();
    if (activePage === "add-product") return renderAddProduct();
    if (activePage === "manage-products") return renderManageProducts();
    if (activePage === "orders") return renderOrders();
    if (activePage === "earnings") return renderEarnings();
    if (activePage === "store-settings") return renderStoreSettings();
    if (activePage === "vendor-profile") return renderVendorProfile();
    return renderDashboardHome();
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[260px_1fr]">
        <div className="hidden md:block">
          <VendorSidebar activeKey={activePage} onSelect={handleMenuSelect} />
        </div>

        <MobileDashboardDrawer
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          variant="vendor"
        >
          <VendorSidebar activeKey={activePage} onSelect={handleMenuSelect} edge="right" />
        </MobileDashboardDrawer>

        <section className="p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Vendor Panel</p>
              <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700 md:hidden"
              aria-expanded={mobileSidebarOpen}
              aria-label="Open menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <HamburgerIcon className="h-6 w-6" />
            </button>
          </div>

          {message && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {message}
            </div>
          )}
          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading vendor data...
            </section>
          ) : (
            renderContent()
          )}
        </section>
      </div>
    </main>
  );
}

export default VendorDashboardPage;
