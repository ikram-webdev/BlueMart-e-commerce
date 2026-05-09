import { useEffect, useState } from "react";
import DashboardButton from "../../components/dashboard/DashboardButton";

function ProfileSettings({ profile, onSaved }) {
  const [local, setLocal] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLocal(profile);
  }, [profile.name, profile.phone, profile.email]);

  const submitProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!local.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await onSaved({
        name: local.name.trim(),
        phone: local.phone.trim(),
      });
      setSuccess("Profile saved to your account.");
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submitProfile} className="dashboard-panel">
      <h2>Profile Settings</h2>
      <p className="text-sm text-slate-600 mb-3">
        Name and phone are stored in the database. Email cannot be changed here.
      </p>
      <div className="form-grid-3">
        <input
          value={local.name}
          onChange={(e) => setLocal((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Full name"
          className="dashboard-input"
        />
        <input
          type="email"
          value={local.email}
          readOnly
          disabled
          className="dashboard-input opacity-75 cursor-not-allowed"
          title="Email is linked to your account"
        />
        <input
          value={local.phone}
          onChange={(e) => setLocal((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="Phone"
          className="dashboard-input"
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      <DashboardButton className="mt-3" disabled={saving}>
        {saving ? "Saving…" : "Update Profile"}
      </DashboardButton>
    </form>
  );
}

export default ProfileSettings;
