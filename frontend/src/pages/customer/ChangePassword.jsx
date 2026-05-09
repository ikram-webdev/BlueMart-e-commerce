import { useState } from "react";
import DashboardButton from "../../components/dashboard/DashboardButton";
import { api } from "../../api/client";

function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const submitPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    setSaving(true);
    try {
      await api.changeCustomerPassword({
        old_password: form.oldPassword,
        new_password: form.newPassword,
      });
      setSuccess("Password updated in the database.");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submitPassword} className="dashboard-panel">
      <h2>Change Password</h2>
      <div className="form-grid-3">
        <input
          type="password"
          value={form.oldPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
          placeholder="Old password"
          className="dashboard-input"
          required
        />
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
          placeholder="New password"
          className="dashboard-input"
          required
        />
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          placeholder="Confirm password"
          className="dashboard-input"
          required
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      <DashboardButton className="mt-3" disabled={saving}>
        {saving ? "Updating…" : "Update Password"}
      </DashboardButton>
    </form>
  );
}

export default ChangePassword;
