import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from "./i18n/I18nContext";
createRoot(document.getElementById("root")).render(
  _jsx(StrictMode, {
    children: _jsx(BrowserRouter, {
      children: _jsx(I18nProvider, { children: _jsx(App, {}) }),
    }),
  }),
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  });
}
