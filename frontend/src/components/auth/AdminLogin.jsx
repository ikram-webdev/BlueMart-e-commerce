import { useState } from "react";
import InputField from "../common/InputField";

function AdminLogin({ form, errors, onChange, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} noValidate>
      <InputField
        id="admin-login-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="Enter admin email"
        error={errors.email}
      />

      <InputField
        id="admin-login-password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        placeholder="Enter password"
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

      <button
        type="submit"
        disabled={loading}
        className="auth-submit-btn"
      >
        {loading ? "Please wait..." : "Login"}
      </button>
    </form>
  );
}

export default AdminLogin;
