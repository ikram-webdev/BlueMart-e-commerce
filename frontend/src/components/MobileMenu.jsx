import { Link } from "react-router-dom";

function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="mobile-menu">
      <button onClick={onClose}>Close</button>
      <Link to="/" onClick={onClose}>Home</Link>
      <Link to="/products" onClick={onClose}>Products</Link>
      <Link to="/cart" onClick={onClose}>Cart</Link>
      <Link to="/customer" onClick={onClose}>Customer</Link>
      <Link to="/vendor" onClick={onClose}>Vendor</Link>
      <Link to="/admin" onClick={onClose}>Admin</Link>
    </div>
  );
}

export default MobileMenu;
