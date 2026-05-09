import { Outlet } from "react-router-dom";

/** Plain outlet wrapper — avoids Framer Motion + AnimatePresence + Outlet opacity glitches that hid auth/cart/wishlist */
export default function PublicAnimatedLayout() {
  return (
    <div className="bluemart-page-shell">
      <Outlet />
    </div>
  );
}
