function AdminModal({ title, open, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      aria-hidden={false}
    >
      <section
        className="flex max-h-[min(92dvh,920px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:max-h-[min(85vh,800px)] sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <h3 id="admin-modal-title" className="min-w-0 truncate text-base font-semibold leading-snug text-slate-900 sm:text-lg">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-5 sm:py-4 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4">{footer}</div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminModal;
