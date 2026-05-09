import { useState } from "react";
import InputField from "../common/InputField";

function VendorRegister({ form, errors, onChange, onSubmit, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} noValidate>
      <InputField
        id="vendor-register-store-name"
        label="Store Name"
        value={form.storeName}
        onChange={(event) => onChange("storeName", event.target.value)}
        placeholder="Enter store name"
        error={errors.storeName}
      />

      <InputField
        id="vendor-register-owner-name"
        label="Owner Name"
        value={form.ownerName}
        onChange={(event) => onChange("ownerName", event.target.value)}
        placeholder="Enter owner name"
        error={errors.ownerName}
      />

      <InputField
        id="vendor-register-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        placeholder="Enter email"
        error={errors.email}
      />

      <InputField
        id="vendor-register-phone"
        label="Phone"
        value={form.phone}
        onChange={(event) => onChange("phone", event.target.value)}
        placeholder="Enter phone number"
        error={errors.phone}
      />

      <div className="auth-subform-divider" />
      <p className="auth-subform-title">CNIC verification</p>
      <p className="auth-field-hint">Upload clear photos of both sides of your CNIC (JPG, PNG, or WebP — max 3MB each).</p>

      <div className="auth-field">
        <label htmlFor="vendor-cnic-front" className="auth-label">
          CNIC — front side <span className="auth-required-star">*</span>
        </label>
        <input
          id="vendor-cnic-front"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className={`auth-file-input ${errors.cnicFront ? "has-error" : ""}`}
          onChange={(e) => onChange("cnicFront", e.target.files?.[0] ?? null)}
        />
        {form.cnicFront instanceof File ? (
          <p className="auth-file-name">{form.cnicFront.name}</p>
        ) : null}
        {errors.cnicFront ? <p className="auth-error">{errors.cnicFront}</p> : null}
      </div>

      <div className="auth-field">
        <label htmlFor="vendor-cnic-back" className="auth-label">
          CNIC — back side <span className="auth-required-star">*</span>
        </label>
        <input
          id="vendor-cnic-back"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className={`auth-file-input ${errors.cnicBack ? "has-error" : ""}`}
          onChange={(e) => onChange("cnicBack", e.target.files?.[0] ?? null)}
        />
        {form.cnicBack instanceof File ? (
          <p className="auth-file-name">{form.cnicBack.name}</p>
        ) : null}
        {errors.cnicBack ? <p className="auth-error">{errors.cnicBack}</p> : null}
      </div>

      <InputField
        id="vendor-register-password"
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
        id="vendor-register-confirm-password"
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

export default VendorRegister;
