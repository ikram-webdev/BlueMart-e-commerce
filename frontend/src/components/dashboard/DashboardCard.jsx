function DashboardCard({ title, value, subtitle }) {
  return (
    <article className="dashboard-card">
      <p className="dashboard-card-title">{title}</p>
      <p className="dashboard-card-value">{value}</p>
      {subtitle ? <p className="dashboard-card-subtitle">{subtitle}</p> : null}
    </article>
  );
}

export default DashboardCard;
