// Cloudinary upload widget loader — idempotent. Multiple components can
// call this; the script is injected exactly once and subsequent calls
// resolve from the same Promise.

const CLOUDINARY_WIDGET_SRC =
  "https://upload-widget.cloudinary.com/global/all.js";

let widgetScriptPromise = null;

export function loadCloudinaryWidgetScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.cloudinary?.createUploadWidget) return Promise.resolve();
  if (widgetScriptPromise) return widgetScriptPromise;

  widgetScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScriptPromise = null;
      reject(new Error("Failed to load Cloudinary upload widget."));
    };
    document.body.appendChild(script);
  });
  return widgetScriptPromise;
}

export const STANBOX_WIDGET_PALETTE = {
  window: "#1a1a1a",
  sourceBg: "#222",
  windowBorder: "#444",
  tabIcon: "#fff",
  menuIcons: "#bbb",
  textDark: "#fff",
  textLight: "#bbb",
  link: "#4ade80",
  action: "#4ade80",
  inactiveTabIcon: "#888",
  error: "#ff7a7a",
  inProgress: "#4ade80",
  complete: "#4ade80",
};
