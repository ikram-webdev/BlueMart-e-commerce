function DashboardButton({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "dashboard-btn-primary",
    secondary: "dashboard-btn-secondary",
    danger: "dashboard-btn-danger",
    outline: "dashboard-btn-outline",
  };

  return (
    <button
      className={`dashboard-btn ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default DashboardButton;
