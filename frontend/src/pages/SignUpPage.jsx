import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Tabs from "../components/auth/Tabs";
import CustomerRegister from "../components/auth/CustomerRegister";
import VendorRegister from "../components/auth/VendorRegister";
import "./auth.css";

function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role");
  const [activeTab, setActiveTab] = useState(
    initialRole === "vendor" || initialRole === "customer" ? initialRole : "customer"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    customerRegister: {},
    vendorRegister: {},
  });
  const [forms, setForms] = useState({
    customerRegister: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
    vendorRegister: {
      storeName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      cnicFront: null,
      cnicBack: null,
    },
  });

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "customer" || role === "vendor") {
      setActiveTab(role);
    }
  }, [searchParams]);

  const tabs = useMemo(
    () => [
      { key: "customer", label: "Customer Register" },
      { key: "vendor", label: "Vendor Register" },
    ],
    []
  );

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

  const validateCustomerRegister = (form) => {
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) nextErrors.email = "Please enter a valid email";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) nextErrors.confirmPassword = "Please confirm password";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match";
    return nextErrors;
  };

  const validateVendorRegister = (form) => {
    const nextErrors = {};
    if (!form.storeName.trim()) nextErrors.storeName = "Store name is required";
    if (!form.ownerName.trim()) nextErrors.ownerName = "Owner name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) nextErrors.email = "Please enter a valid email";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) nextErrors.confirmPassword = "Please confirm password";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match";
    const imgOk = (f) =>
      f instanceof File && ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    if (!(form.cnicFront instanceof File)) nextErrors.cnicFront = "CNIC front image is required";
    else if (!imgOk(form.cnicFront)) nextErrors.cnicFront = "Use JPG, PNG, or WebP (max 3MB)";
    if (!(form.cnicBack instanceof File)) nextErrors.cnicBack = "CNIC back image is required";
    else if (!imgOk(form.cnicBack)) nextErrors.cnicBack = "Use JPG, PNG, or WebP (max 3MB)";
    const maxBytes = 3 * 1024 * 1024;
    if (form.cnicFront instanceof File && form.cnicFront.size > maxBytes) {
      nextErrors.cnicFront = "CNIC front file is too large (max 3MB)";
    }
    if (form.cnicBack instanceof File && form.cnicBack.size > maxBytes) {
      nextErrors.cnicBack = "CNIC back file is too large (max 3MB)";
    }
    return nextErrors;
  };

  const handleCustomerRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateCustomerRegister(forms.customerRegister);
    setErrors((prev) => ({ ...prev, customerRegister: nextErrors }));
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const payload = forms.customerRegister;
      await api.register({
        name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        password: payload.password,
      });
      setMessage("Customer registration successful. Please login.");
      setTimeout(() => navigate("/auth"), 500);
    } catch (error) {
      setMessage(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVendorRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateVendorRegister(forms.vendorRegister);
    setErrors((prev) => ({ ...prev, vendorRegister: nextErrors }));
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const payload = forms.vendorRegister;
      await api.vendorRegister({
        name: payload.ownerName.trim(),
        email: payload.email.trim(),
        password: payload.password,
        store_name: payload.storeName.trim(),
        phone: payload.phone.trim(),
        cnicFront: payload.cnicFront,
        cnicBack: payload.cnicBack,
      });
      setMessage("Vendor registration submitted. Please login after approval.");
      setTimeout(() => navigate("/auth"), 700);
    } catch (error) {
      setMessage(error.message || "Vendor registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderRegisterForm = () => {
    if (activeTab === "customer") {
      return (
        <CustomerRegister
          form={forms.customerRegister}
          errors={errors.customerRegister}
          loading={loading}
          onChange={(field, value) => setFormField("customerRegister", field, value)}
          onSubmit={handleCustomerRegister}
        />
      );
    }
    if (activeTab === "vendor") {
      return (
        <VendorRegister
          form={forms.vendorRegister}
          errors={errors.vendorRegister}
          loading={loading}
          onChange={(field, value) => setFormField("vendorRegister", field, value)}
          onSubmit={handleVendorRegister}
        />
      );
    }
    return null;
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <h2 id="signup-title" className="auth-title">Register</h2>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        <div className="auth-form-wrap">{renderRegisterForm()}</div>
        {message && <p className="auth-message">{message}</p>}
        <p className="auth-footnote">
          Already have an account? <Link to="/auth" className="auth-link">Sign In</Link>
        </p>
      </section>
    </main>
  );
}

export default SignUpPage;
