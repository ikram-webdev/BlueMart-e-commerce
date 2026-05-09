import DashboardCard from "../../components/dashboard/DashboardCard";
import DashboardTable from "../../components/dashboard/DashboardTable";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatPkr } from "../../utils/price";

function DashboardHome({ userName, orders, wishlistCount, onOpenOrder }) {
  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;

  return (
    <section className="customer-section">
      <div className="dashboard-panel">
        <h2>Dashboard Home</h2>
        <p>Good to see you, {userName}. Here is your latest activity.</p>
      </div>

      <div className="dashboard-stats-grid">
        <DashboardCard title="Total Orders" value={orders.length} />
        <DashboardCard title="Pending Orders" value={pendingOrders} />
        <DashboardCard title="Wishlist Items" value={wishlistCount} />
      </div>

      <div className="dashboard-panel">
        <h3>Recent Orders</h3>
        <DashboardTable columns={["Order ID", "Date", "Status", "Total", "Actions"]}>
          {recentOrders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.date}</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>{formatPkr(order.total)}</td>
              <td>
                <button
                  type="button"
                  onClick={() => onOpenOrder(order.id)}
                  className="dashboard-link-btn"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </DashboardTable>
      </div>
    </section>
  );
}

export default DashboardHome;
