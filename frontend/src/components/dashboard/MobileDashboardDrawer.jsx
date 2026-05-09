import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DrawerCloseXIcon } from "./MobileNavIcons";

const SCRIM_EASE = [0.4, 0, 0.2, 1];
const SCRIM_DURATION = 0.22;
const SPRING_PANEL = { type: "spring", damping: 32, stiffness: 380, mass: 0.85 };

/** Fully transparent tap target to close; no dimming layer. */
const SCRIM_SHADE = "transparent";

const VARIANTS = {
  admin: {
    scrimColor: SCRIM_SHADE,
    panelWidth: "min(22rem,calc(100vw - 12px))",
    maxWidth: "360px",
    zBase: 200,
  },
  vendor: {
    scrimColor: SCRIM_SHADE,
    panelWidth: "min(20rem,calc(100vw - 12px))",
    maxWidth: "320px",
    zBase: 200,
  },
  customer: {
    scrimColor: SCRIM_SHADE,
    panelWidth: "min(20rem,calc(100vw - 44px))",
    maxWidth: "320px",
    zBase: 2100,
  },
};

const CLOSE_BTN = {
  admin:
    "rounded-full border border-white/35 bg-slate-900/90 p-2 text-white shadow-md hover:bg-slate-800 hover:border-white/50",
  vendor:
    "rounded-full border-2 border-white bg-blue-600 p-2 text-white shadow-[0_4px_14px_rgba(37,99,235,0.55),0_1px_3px_rgba(15,23,42,0.12)] ring-2 ring-blue-500/70 hover:bg-blue-700 hover:ring-blue-400 hover:shadow-[0_6px_20px_rgba(29,78,216,0.5)]",
  customer:
    "rounded-full border border-white/40 bg-white/15 p-2 text-white shadow-md hover:bg-white/25 hover:border-white/55",
};

/** Fills the sliding column so the close row sits inside the same surface as the sidebar. */
const PANEL_SURFACE = {
  admin: { backgroundColor: "#0f172a" },
  vendor: { backgroundColor: "#ffffff" },
  customer: {
    backgroundColor: "#1d4ed8",
    backgroundImage: "linear-gradient(165deg, #1e40af 0%, #2563eb 42%, #1d4ed8 100%)",
  },
};

/**
 * Mobile overlay + drawer: backdrop fades, panel slides from the right (LTR).
 */
function MobileDashboardDrawer({ open, onClose, children, variant = "admin" }) {
  const cfg = VARIANTS[variant] || VARIANTS.admin;
  const zScrim = cfg.zBase;
  const zPanel = cfg.zBase + 1;

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence mode="sync">
      {open ? (
        <>
          <motion.button
            key={`dashboard-drawer-scrim-${variant}`}
            type="button"
            className="fixed inset-0 min-h-[100dvh] w-full cursor-pointer border-0 p-0 md:hidden"
            style={{
              zIndex: zScrim,
              backgroundColor: cfg.scrimColor,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: SCRIM_DURATION, ease: SCRIM_EASE }}
            onClick={onClose}
            aria-label="Close menu"
          />
          <motion.div
            key={`dashboard-drawer-panel-${variant}`}
            className="fixed top-0 right-0 flex h-[100dvh] max-h-screen flex-col overflow-hidden shadow-[-12px_0_36px_rgba(15,23,42,0.2)] md:hidden"
            style={{
              zIndex: zPanel,
              width: cfg.panelWidth,
              maxWidth: cfg.maxWidth,
              ...(PANEL_SURFACE[variant] || PANEL_SURFACE.admin),
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING_PANEL}
          >
            <div
              className="flex shrink-0 justify-end px-3 pb-2"
              style={{ paddingTop: "max(12px, env(safe-area-inset-top))", paddingInlineEnd: "max(12px, env(safe-area-inset-right))" }}
            >
              <button
                type="button"
                className={`flex shrink-0 cursor-pointer touch-manipulation items-center justify-center border-0 p-0 ${variant === "vendor" ? "h-11 w-11" : "h-10 w-10"} ${CLOSE_BTN[variant] || CLOSE_BTN.vendor}`}
                onClick={onClose}
                aria-label="Close menu"
              >
                <DrawerCloseXIcon className={variant === "vendor" ? "h-5 w-5" : "h-[18px] w-[18px]"} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default MobileDashboardDrawer;
