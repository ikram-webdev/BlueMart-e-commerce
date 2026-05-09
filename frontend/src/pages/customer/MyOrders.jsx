import DashboardTable from "../../components/dashboard/DashboardTable";
import DashboardButton from "../../components/dashboard/DashboardButton";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { formatPkr } from "../../utils/price";

function MyOrders({ orders, onOpenOrder }) {
  return (
    <section className="dashboard-panel">
      <h2>My Orders</h2>
      <DashboardTable columns={["Order ID", "Date", "Status", "Total", "Action"]}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>#{order.id}</td>
            <td>{order.date}</td>
            <td>
              <StatusBadge status={order.status} />
            </td>
            <td>{formatPkr(order.total)}</td>
            <td>
              <DashboardButton variant="outline" onClick={() => onOpenOrder(order.id)}>
                View Details
              </DashboardButton>
            </td>
          </tr>
        ))}
      </DashboardTable>
    </section>
  );
}

export default MyOrders;
