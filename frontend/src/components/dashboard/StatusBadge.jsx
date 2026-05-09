function StatusBadge({ status }) {
  const tone =
    status === "Delivered"
      ? "status-delivered"
      : status === "Pending"
        ? "status-pending"
        : status === "Shipped"
          ? "status-shipped"
          : "status-default";

  return <span className={`status-badge ${tone}`}>{status}</span>;
}

export default StatusBadge;
