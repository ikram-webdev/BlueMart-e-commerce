import { HamburgerIcon } from "../dashboard/MobileNavIcons";

function AdminTopbar({ title, onOpenMobileSidebar, menuOpen = false }) {
  return (
    <header className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-blue-800/40 bg-blue-950/45 px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-blue-200/80">BlueMart</p>
        <h1 className="truncate text-xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="max-w-[6.5rem] text-right text-[10px] leading-tight text-blue-100 sm:max-w-[11rem] sm:text-sm">
          <p className="font-semibold">Admin Panel</p>
          <p className="mt-0.5 hidden text-blue-200/75 sm:block sm:text-xs">Manage store operations</p>
        </div>
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/65 bg-blue-900/65 text-blue-50 shadow-inner transition hover:border-blue-400/80 hover:bg-blue-800/75 md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <HamburgerIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

export default AdminTopbar;
