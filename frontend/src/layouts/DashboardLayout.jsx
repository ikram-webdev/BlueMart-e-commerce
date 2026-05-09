import { useNavigate } from "react-router-dom";
import { getApiBase } from "../api/client";

function DashboardLayout({ title, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${getApiBase()}/auth/index.php?action=logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // no-op
    }

    localStorage.removeItem("bluemart_user");
    localStorage.removeItem("bluemart_role");
    navigate("/auth");
  };

  return (
    <section className="dashboard container">
      <div className="section-header">
        <h2>{title}</h2>
        <button type="button" className="primary-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="card">{children}</div>
    </section>
  );
}

export default DashboardLayout;
