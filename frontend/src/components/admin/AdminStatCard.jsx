function AdminStatCard({ title, value, subtitle }) {
  return (
    <article className="rounded-xl border border-blue-800/45 bg-blue-950/45 p-4 shadow-sm">
      <p className="text-sm text-blue-100/80">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-blue-100/75">{subtitle}</p>
    </article>
  );
}

export default AdminStatCard;
