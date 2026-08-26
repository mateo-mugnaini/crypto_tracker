import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import { useOptionalAlerts } from "../../features/alerts/AlertsContext";
import styles from "./Topbar.module.css";
function NavIcon({ kind }) {
  const paths = {
    overview: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Zm10-7h6v-3h-6v3Z",
    portfolio: "M3 7h18v13H3V7Zm3-4h12l2 4H4l2-4Zm3 9h6m-6 4h4",
    market: "M4 18 9 12l4 4 7-9M4 20h16",
    favorites:
      "m12 20-1.45-1.32C5.4 14.36 2 11.28 2 7.5A4.5 4.5 0 0 1 6.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 15.5 3 4.5 4.5 0 0 1 20 7.5c0 3.78-3.4 6.86-8.55 11.18L12 20Z",
    history: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    compare: "M5 19V9m7 10V5m7 14v-7",
    alerts: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-4 13h-2",
  };
  return _jsx("svg", {
    "aria-hidden": "true",
    className: styles.navIcon,
    fill: "none",
    viewBox: "0 0 24 24",
    children: _jsx("path", {
      d: paths[kind],
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.8",
    }),
  });
}
function ActionButtons() {
  const { logout, user } = useAuth();
  const { isAutoRefreshEnabled, refresh, status } = useMarket();
  const unreadCount = useOptionalAlerts()?.unreadCount ?? 0;
  const isRefreshing = status === "loading";
  return _jsxs("div", {
    className: styles.actions,
    children: [
      _jsxs("span", {
        className: styles.userIdentity,
        children: [
          _jsx("span", {
            className: styles.avatar,
            children: user?.username?.slice(0, 1).toUpperCase(),
          }),
          _jsxs("span", {
            children: [
              _jsx("strong", { children: user?.username }),
              _jsx("small", {
                children: isAutoRefreshEnabled
                  ? "Sincronización activa"
                  : "Vista manual",
              }),
            ],
          }),
        ],
      }),
      _jsxs(NavLink, {
        "aria-label": "Ver alertas",
        className: styles.notificationButton,
        title: unreadCount ? `${unreadCount} alertas nuevas` : "Ver alertas",
        to: "/alerts",
        children: [
          _jsx("svg", {
            "aria-hidden": "true",
            fill: "none",
            viewBox: "0 0 24 24",
            children: _jsx("path", {
              d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-4 13h-2",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "1.8",
            }),
          }),
          unreadCount > 0 &&
            _jsx("span", {
              className: styles.notificationCount,
              children: unreadCount > 9 ? "9+" : unreadCount,
            }),
        ],
      }),
      _jsxs("button", {
        "aria-label": "Actualizar mercado",
        className: styles.iconButton,
        disabled: isRefreshing,
        onClick: () => void refresh(),
        type: "button",
        children: [
          _jsx("svg", {
            "aria-hidden": "true",
            fill: "none",
            viewBox: "0 0 24 24",
            children: _jsx("path", {
              d: "M20 11a8 8 0 0 0-14.9-3M4 5v4h4m-4 4a8 8 0 0 0 14.9 3M20 19v-4h-4",
              stroke: "currentColor",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "1.8",
            }),
          }),
          _jsx("span", { children: isRefreshing ? "Actualizando" : "Actualizar" }),
        ],
      }),
      _jsx("button", {
        className: styles.logoutButton,
        onClick: logout,
        type: "button",
        children: "Salir",
      }),
    ],
  });
}
const links = [
  ["/dashboard", "Resumen", "overview"],
  ["/portfolio", "Mi cartera", "portfolio"],
  ["/market", "Mercado", "market"],
  ["/favorites", "Favoritos", "favorites"],
  ["/history", "Historial", "history"],
  ["/compare", "Comparativa", "compare"],
  ["/alerts", "Alertas", "alerts"],
];
export default function Topbar() {
  return _jsxs("div", {
    className: styles.navigationRoot,
    children: [
      _jsxs("aside", {
        "aria-label": "Navegaci\u00F3n principal",
        className: styles.sidebar,
        children: [
          _jsxs("div", {
            className: styles.brand,
            children: [
              _jsx("span", { className: styles.brandMark, children: "C" }),
              _jsxs("span", {
                children: [
                  _jsx("strong", { children: "Crypto Tracker" }),
                  _jsx("small", { children: "Market intelligence" }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: styles.navGroup,
            children: [
              _jsx("span", { className: styles.navLabel, children: "Workspace" }),
              _jsx("nav", {
                children: links.map(([to, label, icon]) =>
                  _jsxs(
                    NavLink,
                    {
                      className: ({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.activeLink : ""}`,
                      end: to === "/dashboard",
                      to: to,
                      children: [
                        _jsx(NavIcon, { kind: icon }),
                        _jsx("span", { children: label }),
                      ],
                    },
                    to,
                  ),
                ),
              }),
            ],
          }),
          _jsxs("div", {
            className: styles.sidebarFooter,
            children: [
              _jsx("span", { className: styles.statusDot }),
              _jsxs("span", {
                children: [
                  _jsx("strong", { children: "API conectada" }),
                  _jsx("small", { children: "Datos sincronizados" }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("header", {
        className: styles.mobileHeader,
        children: [
          _jsxs("div", {
            className: styles.brand,
            children: [
              _jsx("span", { className: styles.brandMark, children: "C" }),
              _jsxs("span", {
                children: [
                  _jsx("strong", { children: "Crypto Tracker" }),
                  _jsx("small", { children: "Market intelligence" }),
                ],
              }),
            ],
          }),
          _jsx(ActionButtons, {}),
          _jsx("nav", {
            "aria-label": "Navegaci\u00F3n m\u00F3vil",
            className: styles.mobileNav,
            children: links.map(([to, label, icon]) =>
              _jsxs(
                NavLink,
                {
                  className: ({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileActiveLink : ""}`,
                  end: to === "/dashboard",
                  to: to,
                  children: [
                    _jsx(NavIcon, { kind: icon }),
                    _jsx("span", { children: label }),
                  ],
                },
                to,
              ),
            ),
          }),
        ],
      }),
      _jsx("div", {
        className: styles.desktopActions,
        children: _jsx(ActionButtons, {}),
      }),
    ],
  });
}
