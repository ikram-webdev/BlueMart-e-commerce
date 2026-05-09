function AdminPagination({ page, totalPages, onChange }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button
        type="button"
        className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-slate-600">
        Page {page} / {Math.max(totalPages, 1)}
      </span>
      <button
        type="button"
        className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default AdminPagination;
