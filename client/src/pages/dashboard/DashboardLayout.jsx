import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMarket } from "../../features/market/MarketContext";
import Topbar from "../../components/dashboard/Topbar";
import styles from "./DashboardPage.module.css";
export default function DashboardLayout({ children, description, eyebrow, title }) {
  const { isAutoRefreshEnabled, lastUpdated, liveStatus, status } = useMarket();
  const syncLabel =
    status === "loading"
      ? "Actualizando mercado"
      : liveStatus === "connected"
        ? "Canal live conectado"
        : liveStatus === "connecting"
          ? "Conectando canal live"
          : liveStatus === "fallback"
            ? "Fallback por polling"
            : isAutoRefreshEnabled
              ? "Sincronización automática activa"
              : "Actualización manual disponible";
  return _jsxs("div", {
    className: styles.shell,
    children: [
      _jsx(Topbar, {}),
      _jsx("div", {
        className: styles.content,
        children: _jsxs("main", {
          className: styles.dashboard,
          children: [
            _jsxs("header", {
              className: styles.pageHeader,
              children: [
                _jsxs("div", {
                  children: [
                    _jsx("span", { className: styles.eyebrow, children: eyebrow }),
                    _jsx("h1", { children: title }),
                    _jsx("p", { children: description }),
                  ],
                }),
                _jsxs("div", {
                  className: styles.headerMeta,
                  children: [
                    _jsxs("span", {
                      className: styles.liveBadge,
                      children: [_jsx("span", {}), " ", syncLabel],
                    }),
                    _jsx("small", {
                      children: lastUpdated
                        ? `Última lectura ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                        : "Esperando la primera lectura",
                    }),
                  ],
                }),
              ],
            }),
            children,
          ],
        }),
      }),
    ],
  });
}
