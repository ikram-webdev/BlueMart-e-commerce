import { useState } from "react";
import InputField from "../common/InputField";

function AdminRegister({ form, errors, onChange, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} noValidate>
      <InputField
        id="admin-register-name"
        label="Full Name"
        value={form.name}
        onChange={(event) => onChange("name", event.target.value)}
        placeholder="Enter full name"
        error={errors.name}
      />

      <InputField
        id="admin-register-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="Enter admin email"
        error={errors.email}
      />

      <InputField
        id="admin-register-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder="Minimum 8 characters"
        error={errors.password}
        rightNode={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="password-toggle-btn"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      <InputField
        id="admin-register-confirm-password"
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(event) => onChange("confirmPassword", event.target.value)}
        placeholder="Confirm password"
        error={errors.confirmPassword}
        rightNode={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="password-toggle-btn"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="auth-submit-btn"
      >
        {loading ? "Please wait..." : "Register as Admin"}
      </button>
    </form>
  );
}

export default AdminRegister;
