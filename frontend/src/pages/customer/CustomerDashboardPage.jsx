import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { fallbackImage } from "../../data/products";
import { notify } from "../../utils/notify";
import CustomerLayout from "../../layouts/CustomerLayout";
import DashboardHome from "./DashboardHome";
import MyOrders from "./MyOrders";
import OrderDetails from "./OrderDetails";
import Wishlist from "./Wishlist";
import SavedAddresses from "./SavedAddresses";
import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";
import "./customer-dashboard.css";

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [profileBootstrapped, setProfileBootstrapped] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);

  const menuItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "orders", label: "My Orders" },
      { key: "wishlist", label: "Wishlist" },
      { key: "addresses", label: "Saved Addresses" },
      { key: "profile", label: "Profile Settings" },
      { key: "password", label: "Change Password" },
    ],
    []
  );

  const normalizeStatus = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value === "pending") return "Pending";
    if (value === "processing") return "Packed";
    if (value === "shipped") return "Shipped";
    if (value === "delivered") return "Delivered";
    if (value === "cancelled") return "Cancelled";
    return "Pending";
  };

  const normalizeTrackingStage = (status) => {
    const value = String(status || "pending").toLowerCase();
    if (value === "delivered") return "Delivered";
    if (value === "shipped") return "Shipped";
    if (value === "processing") return "Packed";
    return "Placed";
  };

  const paymentLabelFromOrder = (order) =>
    String(order.payment_status || "").toLowerCase() === "paid" ? "Paid" : "Pending";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pr = await api.getCustomerProfile();
        if (!mounted || !pr.user) return;
        const u = pr.user;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        });
        try {
          localStorage.setItem(
            "bluemart_user",
            JSON.stringify({
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || "",
              role: u.role,
            })
          );
        } catch (_) {
          /* ignore */
        }
      } catch (_e) {
        try {
          const raw = JSON.parse(localStorage.getItem("bluemart_user") || "{}");
          if (mounted) {
            setProfile({
              name: raw.name || "",
              email: raw.email || "",
              phone: raw.phone || "",
            });
          }
        } catch (_) {
          /* ignore */
        }
      } finally {
        if (mounted) setProfileBootstrapped(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await api.getCustomerAddresses();
      const rows = res.addresses || [];
      setAddresses(
        rows.map((a) => ({
          id: Number(a.id),
          label: a.label || "",
          address: a.address || "",
          city: a.city || "",
        }))
      );
    } catch (_e) {
      setAddresses([]);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([api.getCustomerOrders(), api.getWishlist()]);
      const profileName =
        JSON.parse(localStorage.getItem("bluemart_user") || "{}").name || profile.name || "Customer";

      const nextOrders = (ordersRes.orders || []).map((order) => ({
        id: Number(order.id),
        date: order.created_at ? String(order.created_at).slice(0, 10) : "-",
        status: normalizeStatus(order.status),
        total: Number(order.total_amount || 0),
        trackingStage: normalizeTrackingStage(order.status),
        items: [],
        shipping: {
          name: order.customer_name || profileName,
          address: order.address || "-",
          city: order.city || "-",
        },
        payment: {
          method: order.payment_method || "Cash on Delivery",
          status: paymentLabelFromOrder(order),
        },
      }));
      setOrders(nextOrders);
      setSelectedOrderId((prev) => prev ?? nextOrders[0]?.id ?? null);

      setWishlist(
        (wishlistRes.items || []).map((item) => ({
          id: Number(item.product_id || item.id),
          name: item.name || "Product",
          price: Number(item.discount_price || item.price || 0),
          image: item.thumbnail || fallbackImage,
        }))
      );
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Failed to load customer dashboard data.");
    }
  }, [profile.name]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    if (!profileBootstrapped) return undefined;
    loadDashboardData();
    const timer = setInterval(loadDashboardData, 7000);
    return () => clearInterval(timer);
  }, [loadDashboardData, profileBootstrapped]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (_) {
      /* still clear locally */
    }
    localStorage.removeItem("bluemart_user");
    localStorage.removeItem("bluemart_role");
    navigate("/auth");
  };

  const openOrderDetails = async (orderId) => {
    const oid = Number(orderId);
    setSelectedOrderId(oid);
    setActiveMenu("order-details");
    setOrderDetailLoading(true);
    try {
      const res = await api.getCustomerOrder(oid);
      const apiOrder = res.order || {};
      const lines = res.items || [];
      setOrders((prev) =>
        prev.map((o) =>
          Number(o.id) === oid
            ? {
                ...o,
                items: lines.map((li) => ({
                  id: Number(li.product_id),
                  name: li.name || "Product",
                  qty: Number(li.quantity || 0),
                })),
                payment: {
                  method: apiOrder.payment_method || o.payment?.method || "Cash on Delivery",
                  status:
                    String(apiOrder.payment_status || "").toLowerCase() === "paid" ? "Paid" : "Pending",
                },
                shipping: {
                  name: apiOrder.customer_name || o.shipping?.name,
                  address: apiOrder.address || o.shipping?.address,
                  city: apiOrder.city || o.shipping?.city,
                },
                total: Number(apiOrder.total_amount ?? o.total ?? 0),
              }
            : o
        )
      );
    } catch (error) {
      setMessage(error.message || "Could not load order details.");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleWishlistRemove = async (productId) => {
    try {
      await api.removeWishlist({ product_id: productId });
      notify("Removed from wishlist", "success");
      await loadDashboardData();
      window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
    } catch (error) {
      setMessage(error.message || "Could not remove wishlist item.");
    }
  };

  const handleWishlistAddToCart = async (productId) => {
    try {
      await api.addToCart({ product_id: productId, quantity: 1 });
      notify("Added to cart", "success");
      window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
    } catch (error) {
      setMessage(error.message || "Could not add to cart.");
    }
  };

  const handleSaveAddress = async ({ label, address, city, id }) => {
    setAddressSaving(true);
    try {
      const body =
        id != null ? { id, label, address, city } : { label, address, city };
      await api.saveCustomerAddress(body);
      await loadAddresses();
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    await api.deleteCustomerAddress({ id: addressId });
    await loadAddresses();
  };

  const persistProfile = async ({ name, phone }) => {
    const res = await api.updateCustomerProfile({ name, phone });
    const u = res.user;
    if (!u) return;
    setProfile({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
    });
    try {
      localStorage.setItem(
        "bluemart_user",
        JSON.stringify({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          role: u.role,
        })
      );
    } catch (_) {
      /* ignore */
    }
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const activeLabel = menuItems.find((item) => item.key === activeMenu)?.label || "Dashboard";

  const renderContent = () => {
    if (activeMenu === "dashboard") {
      return (
        <DashboardHome
          userName={profile.name || "Customer"}
          orders={orders}
          wishlistCount={wishlist.length}
          onOpenOrder={openOrderDetails}
        />
      );
    }
    if (activeMenu === "orders") return <MyOrders orders={orders} onOpenOrder={openOrderDetails} />;
    if (activeMenu === "order-details") {
      return <OrderDetails order={selectedOrder} loading={orderDetailLoading} />;
    }
    if (activeMenu === "wishlist") {
      return (
        <Wishlist
          items={wishlist}
          onRemove={handleWishlistRemove}
          onAddToCart={handleWishlistAddToCart}
        />
      );
    }
    if (activeMenu === "addresses") {
      return (
        <SavedAddresses
          addresses={addresses}
          saving={addressSaving}
          onSave={handleSaveAddress}
          onDelete={handleDeleteAddress}
        />
      );
    }
    if (activeMenu === "profile") {
      return <ProfileSettings profile={profile} onSaved={persistProfile} />;
    }
    if (activeMenu === "password") return <ChangePassword />;
    return (
      <DashboardHome
        userName={profile.name || "Customer"}
        orders={orders}
        wishlistCount={wishlist.length}
        onOpenOrder={openOrderDetails}
      />
    );
  };

  return (
    <CustomerLayout
      menuItems={menuItems}
      activeKey={activeMenu}
      onSelect={(key) => {
        setActiveMenu(key);
      }}
      onLogout={handleLogout}
      userName={profile.name || "Customer"}
      pageTitle={activeMenu === "order-details" ? "Order Details" : activeLabel}
    >
      {message ? <section className="dashboard-panel">{message}</section> : null}
      {renderContent()}
    </CustomerLayout>
  );
}

export default CustomerDashboardPage;
