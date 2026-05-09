import { useState } from "react";
import DashboardButton from "../../components/dashboard/DashboardButton";

const emptyAddress = { label: "", address: "", city: "" };

function SavedAddresses({ addresses, saving, onSave, onDelete }) {
  const [form, setForm] = useState(emptyAddress);
  const [editId, setEditId] = useState(null);
  const [localError, setLocalError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const saveAddress = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (!form.label || !form.address || !form.city) {
      setLocalError("Please fill label, address, and city.");
      return;
    }
    try {
      await onSave({
        label: form.label.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        id: editId,
      });
      setForm(emptyAddress);
      setEditId(null);
    } catch (err) {
      setLocalError(err.message || "Could not save address.");
    }
  };

  const onEdit = (address) => {
    setEditId(address.id);
    setForm({ label: address.label, address: address.address, city: address.city });
  };

  return (
    <section className="customer-section">
      <div className="dashboard-panel">
        <h2>Saved Addresses</h2>
        <div className="address-grid">
          {addresses.map((address) => (
            <article key={address.id} className="address-card">
              <p className="address-label">{address.label}</p>
              <p>{address.address}</p>
              <p>{address.city}</p>
              <div className="address-actions">
                <DashboardButton variant="outline" onClick={() => onEdit(address)}>
                  Edit
                </DashboardButton>
                <DashboardButton
                  variant="danger"
                  disabled={deletingId === address.id}
                  onClick={async () => {
                    try {
                      setDeletingId(address.id);
                      await onDelete(address.id);
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {deletingId === address.id ? "…" : "Delete"}
                </DashboardButton>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form onSubmit={saveAddress} className="dashboard-panel">
        <h3>{editId ? "Edit Address" : "Add New Address"}</h3>
        {localError ? <p className="form-error">{localError}</p> : null}
        <div className="form-grid-3">
          <input
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="Home / Office"
            className="dashboard-input"
          />
          <input
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Street address"
            className="dashboard-input"
          />
          <input
            value={form.city}
            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="dashboard-input"
          />
        </div>
        <DashboardButton className="mt-3" disabled={saving}>
          {saving ? "Saving…" : editId ? "Update Address" : "Add Address"}
        </DashboardButton>
      </form>
    </section>
  );
}

export default SavedAddresses;
