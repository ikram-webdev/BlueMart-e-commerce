/**
 * Dev: same-origin `/backend/api` → Vite proxies to PHP (see vite.config.js).
 * Prod (Hostinger etc.): create frontend/.env.production with VITE_API_BASE=https://yourdomain.com/backend/api
 */
export function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    return String(import.meta.env.VITE_API_BASE).replace(/\/$/, "");
  }
  return "/backend/api";
}

const API_BASE = getApiBase();

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

export const api = {
  getCategories: () => request("/categories/index.php?action=list"),
  getProducts: (query = "") => request(`/products/index.php?action=list${query}`),
  getProduct: (id) => request(`/products/index.php?action=single&id=${id}`),
  getCart: () => request("/cart/index.php?action=list"),
  addToCart: (body) =>
    request("/cart/index.php?action=add", { method: "POST", body: JSON.stringify(body) }),
  updateCart: (body) =>
    request("/cart/index.php?action=update", { method: "PUT", body: JSON.stringify(body) }),
  removeCart: (body) =>
    request("/cart/index.php?action=remove", { method: "DELETE", body: JSON.stringify(body) }),
  getWishlist: () => request("/cart/index.php?action=wishlist-list"),
  addWishlist: (body) =>
    request("/cart/index.php?action=wishlist-add", { method: "POST", body: JSON.stringify(body) }),
  removeWishlist: (body) =>
    request("/cart/index.php?action=wishlist-remove", { method: "DELETE", body: JSON.stringify(body) }),
  placeOrder: (body) =>
    request("/orders/index.php?action=place", { method: "POST", body: JSON.stringify(body) }),
  placeDirectOrder: (body) =>
    request("/orders/index.php?action=place-direct", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/auth/index.php?action=login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) =>
    request("/auth/index.php?action=register", { method: "POST", body: JSON.stringify(body) }),
  vendorLogin: (body) =>
    request("/auth/index.php?action=vendor-login", { method: "POST", body: JSON.stringify(body) }),
  vendorRegister: async (payload) => {
    if (!(payload.cnicFront instanceof File) || !(payload.cnicBack instanceof File)) {
      throw new Error("CNIC front and back photos are required");
    }
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("store_name", payload.store_name);
    formData.append("phone", payload.phone ?? "");
    if (payload.description) formData.append("description", payload.description);
    formData.append("cnic_front", payload.cnicFront);
    formData.append("cnic_back", payload.cnicBack);

    const response = await fetch(`${API_BASE}/auth/index.php?action=vendor-register`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const resPayload = await response.json();
    if (!response.ok) {
      throw new Error(resPayload.error || "Vendor registration failed");
    }
    return resPayload;
  },
  adminLogin: (body) =>
    request("/auth/index.php?action=admin-login", { method: "POST", body: JSON.stringify(body) }),
  logout: async () => {
    const response = await fetch(`${API_BASE}/auth/index.php?action=logout`, {
      method: "POST",
      credentials: "include",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Logout failed");
    }
    return payload;
  },
  getCustomerProfile: () => request("/customer/index.php?action=profile"),
  updateCustomerProfile: (body) =>
    request("/customer/index.php?action=profile-update", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  changeCustomerPassword: (body) =>
    request("/customer/index.php?action=change-password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getCustomerAddresses: () => request("/customer/index.php?action=addresses"),
  saveCustomerAddress: (body) =>
    request("/customer/index.php?action=address-save", { method: "POST", body: JSON.stringify(body) }),
  deleteCustomerAddress: (body) =>
    request("/customer/index.php?action=address-delete", { method: "DELETE", body: JSON.stringify(body) }),
  getCustomerOrder: (orderId) =>
    request(`/orders/index.php?action=customer-order&id=${encodeURIComponent(String(orderId))}`),
  getCustomerOrders: () => request("/orders/index.php?action=customer-list"),
  getVendorOrders: () => request("/orders/index.php?action=vendor-list"),
  getAdminOrders: () => request("/orders/index.php?action=admin-list"),
  getAdminVendors: () => request("/admin/index.php?action=vendors"),
  getAdminUsers: () => request("/admin/index.php?action=users"),
  getAdminBanners: () => request("/admin/index.php?action=banners"),
  getAdminCoupons: () => request("/admin/index.php?action=coupons"),
  updateAdminVendorStatus: (body) =>
    request("/admin/index.php?action=vendor-status", { method: "PUT", body: JSON.stringify(body) }),
  updateAdminOrderStatus: (body) =>
    request("/orders/index.php?action=admin-update-status", { method: "PUT", body: JSON.stringify(body) }),
  createCategory: (body) =>
    request("/categories/index.php?action=create", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (body) =>
    request("/categories/index.php?action=update", { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (body) =>
    request("/categories/index.php?action=delete", { method: "DELETE", body: JSON.stringify(body) }),
  getVendorProfile: () => request("/vendor/index.php?action=profile"),
  getVendorProducts: () => request("/vendor/index.php?action=products"),
  createVendorProduct: (body) =>
    request("/products/index.php?action=create", { method: "POST", body: JSON.stringify(body) }),
  updateVendorProduct: (body) =>
    request("/products/index.php?action=update", { method: "PUT", body: JSON.stringify(body) }),
  deleteVendorProduct: (body) =>
    request("/products/index.php?action=delete", { method: "DELETE", body: JSON.stringify(body) }),
  uploadVendorProductImage: async ({ productId, file }) => {
    const formData = new FormData();
    formData.append("product_id", String(productId));
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/products/index.php?action=upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Image upload failed");
    }
    return payload;
  },
};
