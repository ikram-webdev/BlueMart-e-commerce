import { useState } from "react";
import InputField from "../common/InputField";

function VendorLogin({ form, errors, onChange, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} noValidate>
      <InputField
        id="vendor-login-email"
        label="Vendor Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="Enter vendor email"
        error={errors.email}
      />

      <InputField
        id="vendor-login-password"
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
        {loading ? "Please wait..." : "Vendor Login"}
      </button>
    </form>
  );
}

export default VendorLogin;
