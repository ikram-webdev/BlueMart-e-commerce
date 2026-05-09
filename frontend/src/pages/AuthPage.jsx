import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Tabs from "../components/auth/Tabs";
import CustomerLogin from "../components/auth/CustomerLogin";
import VendorLogin from "../components/auth/VendorLogin";
import AdminLogin from "../components/auth/AdminLogin";
import { notify } from "../utils/notify";
import "./auth.css";

function AuthPage() {
  const navigate = useNavigate();
  const getStoredUser = () => {
    const raw = localStorage.getItem("bluemart_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  };
  const [activeTab, setActiveTab] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    customerLogin: {},
    vendorLogin: {},
    adminLogin: {},
  });
  const [forms, setForms] = useState({
    customerLogin: { email: "", password: "" },
    vendorLogin: { email: "", password: "" },
    adminLogin: { email: "", password: "" },
  });

  const tabs = useMemo(
    () => [
      { key: "customer", label: "Customer Login" },
      { key: "vendor", label: "Vendor Login" },
      { key: "admin", label: "Admin Login" },
    ],
    []
  );

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    navigate("/", { replace: true });
  }, [navigate]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFormField = (section, field, value) => {
    setForms((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setErrors((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: "" },
    }));
  };

  const validateLogin = (form) => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) nextErrors.email = "Please enter a valid email";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    return nextErrors;
  };

  const handleCustomerLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateLogin(forms.customerLogin);
    setErrors((prev) => ({ ...prev, customerLogin: nextErrors }));
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const res = await api.login({
        email: forms.customerLogin.email.trim(),
        password: forms.customerLogin.password,
      });
      const user = res.user || {};
      localStorage.setItem("bluemart_user", JSON.stringify(user));
      localStorage.setItem("bluemart_role", user.role || "customer");
      window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
      const displayName = user.name || "Customer";
      notify(`BlueMart welcomes you, ${displayName}! Happy shopping.`, "success", 2600);
      setTimeout(() => {
        navigate(user.role === "vendor" ? "/vendor" : user.role === "admin" ? "/admin" : "/customer", {
          replace: true,
        });
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateLogin(forms.adminLogin);
    setErrors((prev) => ({ ...prev, adminLogin: nextErrors }));
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const res = await api.adminLogin({
        email: forms.adminLogin.email.trim(),
        password: forms.adminLogin.password,
      });
      const admin = res.admin || {};
      const user = { ...admin, role: "admin" };
      localStorage.setItem("bluemart_user", JSON.stringify(user));
      localStorage.setItem("bluemart_role", "admin");
      window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
      const displayName = user.name || "Admin";
      notify(`Welcome, ${displayName}`, "success", 2000);
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVendorLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateLogin(forms.vendorLogin);
    setErrors((prev) => ({ ...prev, vendorLogin: nextErrors }));
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const res = await api.vendorLogin({
        email: forms.vendorLogin.email.trim(),
        password: forms.vendorLogin.password,
      });
      const vendor = res.vendor || {};
      const user = { ...vendor, role: "vendor", name: vendor.name || vendor.store_name || "Vendor" };
      localStorage.setItem("bluemart_user", JSON.stringify(user));
      localStorage.setItem("bluemart_role", "vendor");
      window.dispatchEvent(new CustomEvent("bluemart:cart-sync"));
      const displayName = user.name || "Vendor";
      notify(`BlueMart welcomes you, ${displayName}! Manage orders & products from your dashboard.`, "success", 2800);
      setTimeout(() => {
        navigate("/vendor", { replace: true });
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Vendor login failed");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (activeTab === "customer") {
      return (
        <CustomerLogin
          form={forms.customerLogin}
          errors={errors.customerLogin}
          loading={loading}
          onChange={(field, value) => setFormField("customerLogin", field, value)}
          onSubmit={handleCustomerLogin}
        />
      );
    }
    if (activeTab === "vendor") {
      return (
        <VendorLogin
          form={forms.vendorLogin}
          errors={errors.vendorLogin}
          loading={loading}
          onChange={(field, value) => setFormField("vendorLogin", field, value)}
          onSubmit={handleVendorLogin}
        />
      );
    }
    return (
      <AdminLogin
        form={forms.adminLogin}
        errors={errors.adminLogin}
        loading={loading}
        onChange={(field, value) => setFormField("adminLogin", field, value)}
        onSubmit={handleAdminLogin}
      />
    );
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h2 className="auth-title">Login</h2>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

        <div className="auth-form-wrap">{renderForm()}</div>

        <p className="auth-footnote">
          {activeTab === "customer" ? (
            <>New customer? <Link to="/signup?role=customer" className="auth-link">Create customer account</Link></>
          ) : null}
          {activeTab === "vendor" ? (
            <>Want to sell? <Link to="/signup?role=vendor" className="auth-link">Register as Vendor</Link></>
          ) : null}
        </p>
        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  );
}

export default AuthPage;
