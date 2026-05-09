import { useState } from "react";
import InputField from "../common/InputField";

function CustomerRegister({ form, errors, onChange, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="auth-grid-two">
        <InputField
          id="customer-register-first-name"
          label="First Name"
          value={form.firstName}
          onChange={(event) => onChange("firstName", event.target.value)}
          placeholder="First name"
          error={errors.firstName}
        />
        <InputField
          id="customer-register-last-name"
          label="Last Name"
          value={form.lastName}
          onChange={(event) => onChange("lastName", event.target.value)}
          placeholder="Last name"
          error={errors.lastName}
        />
      </div>

      <InputField
        id="customer-register-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="Enter email"
        error={errors.email}
      />

      <InputField
        id="customer-register-phone"
        label="Phone"
        value={form.phone}
        onChange={(event) => onChange("phone", event.target.value)}
        placeholder="Enter phone number"
        error={errors.phone}
      />

      <InputField
        id="customer-register-password"
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
        id="customer-register-confirm-password"
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
        {loading ? "Please wait..." : "Register"}
      </button>
    </form>
  );
}

export default CustomerRegister;
