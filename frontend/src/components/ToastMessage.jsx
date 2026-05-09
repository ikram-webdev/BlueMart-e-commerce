function ToastMessage({ toast }) {
  if (!toast) return null;

  return (
    <div className={`toast-message ${toast.type || "info"}`} role="status" aria-live="polite">
      <p>{toast.message}</p>
    </div>
  );
}

export default ToastMessage;
