export function notify(message, type = "info", duration = 2500) {
  window.dispatchEvent(
    new CustomEvent("bluemart:toast", {
      detail: { message, type, duration },
    })
  );
}
