import { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ToastMessage from "./components/ToastMessage";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import SignUpPage from "./pages/SignUpPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PublicAnimatedLayout from "./layouts/PublicAnimatedLayout";
import { api, getApiBase } from "./api/client";
import { notify } from "./utils/notify";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const getStoredUser = () => {
    const raw = localStorage.getItem("bluemart_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [cartCount, setCartCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/vendor") ||
    location.pathname.startsWith("/customer");

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) {
      setCartCount(0);
    }
  }, [currentUser]);

  const syncCartCount = useCallback(async () => {
    try {
      const res = await api.getCart();
      const totalQty = (res.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCartCount(totalQty);
    } catch (_error) {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    syncCartCount();
    const timer = setInterval(syncCartCount, 5000);
    return () => clearInterval(timer);
  }, [syncCartCount]);

  useEffect(() => {
    const onCartSync = () => {
      syncCartCount();
    };
    window.addEventListener("bluemart:cart-sync", onCartSync);
    return () => {
      window.removeEventListener("bluemart:cart-sync", onCartSync);
    };
  }, [syncCartCount]);

  useEffect(() => {
    let timeoutId;
    const handleToast = (event) => {
      const detail = event.detail || {};
      setToast({ message: detail.message || "", type: detail.type || "info" });
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setToast(null), Number(detail.duration || 2500));
    };
    window.addEventListener("bluemart:toast", handleToast);
    return () => {
      window.removeEventListener("bluemart:toast", handleToast);
      clearTimeout(timeoutId);
    };
  }, []);

  const onAddToCart = async (item) => {
    const productId = Number(item?.id || item?.product_id);
    const quantity = Math.max(1, Number(item?.quantity || 1));
    if (!productId) {
      notify("Unable to add this product to cart.", "error");
      return;
    }

    try {
      await api.addToCart({ product_id: productId, quantity });
      await syncCartCount();
      notify("Product added to cart", "success");
    } catch (error) {
      const message = error.message || "Failed to add cart";
      if (message.toLowerCase().includes("unauthorized")) {
        notify("Please login first to add items in cart.", "warning");
        navigate("/auth");
        return;
      }
      notify(message, "error");
    }
  };

  const onAddWishlist = async (item) => {
    const title = item?.title || item?.name || "Product";
    const productId = Number(item?.id || item?.product_id);

    if (!productId) {
      notify("Unable to add this product to wishlist.", "error");
      return;
    }

    try {
      await api.addWishlist({ product_id: productId });
      notify(`${title} added to wishlist`, "success");
    } catch (error) {
      const message = error.message || "Failed to add wishlist";
      if (message.toLowerCase().includes("unauthorized")) {
        notify("Please login first to add items in wishlist.", "warning");
        navigate("/auth");
        return;
      }
      notify(message, "error");
    }
  };

  const onBuyNow = async (item, quantity = 1) => {
    const productId = Number(item?.id || item?.product_id);
    if (!productId) {
      notify("Unable to checkout this product.", "error");
      return;
    }
    try {
      if (!currentUser) {
        notify("Please login first to continue checkout.", "warning");
        navigate("/auth");
        return;
      }
      navigate("/checkout", {
        state: {
          buyNowItem: {
            product_id: productId,
            name: item?.title || item?.name || "Product",
            thumbnail: item?.images?.[0] || item?.thumbnail || "",
            unit_price: Number(item?.price || 0),
            quantity: Math.max(1, Number(quantity || 1)),
          },
        },
      });
      notify("Proceeding with Buy Now", "success");
    } catch (_error) {
      notify("Buy now failed", "error");
    }
  };

  const onSearch = () => {
    navigate(`/products?search=${encodeURIComponent(searchText || "")}`);
  };

  const onLogout = async () => {
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
    setCurrentUser(null);
    setCartCount(0);
    navigate("/auth");
  };

  return (
    <>
      {!isDashboardRoute ? (
        <Header
          cartCount={cartCount}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSearch={onSearch}
          currentUser={currentUser}
          onLogout={onLogout}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((prev) => !prev)}
          onCloseMenu={() => setMenuOpen(false)}
        />
      ) : null}
      <Routes>
        <Route element={<PublicAnimatedLayout />}>
          <Route path="/" element={<Home handlers={{ onAddToCart, onAddWishlist, onBuyNow }} />} />
          <Route path="/products" element={<Products handlers={{ onAddToCart, onAddWishlist, onBuyNow }} />} />
          <Route path="/product/:id" element={<ProductDetail handlers={{ onAddToCart, onAddWishlist, onBuyNow }} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <ToastMessage toast={toast} />
      {!isDashboardRoute ? <Footer /> : null}
    </>
  );
}

export default App;
