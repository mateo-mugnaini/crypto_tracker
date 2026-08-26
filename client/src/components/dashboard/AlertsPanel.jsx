import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMarket } from "../../features/market/MarketContext";
import { useAlerts } from "../../features/alerts/AlertsContext";
import { useToast } from "../ui/ToastProvider";
import styles from "./AlertsPanel.module.css";
const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const dateTime = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});
export default function AlertsPanel() {
  const { coins } = useMarket();
  const { showToast } = useToast();
  const {
    alerts,
    notifications,
    unreadCount,
    status,
    error,
    createAlert,
    toggleAlert,
    removeAlert,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAlerts();
  const [coinId, setCoinId] = useState("");
  const [condition, setCondition] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const orderedCoins = useMemo(
    () => [...coins].sort((a, b) => a.name.localeCompare(b.name)),
    [coins],
  );
  const submit = async (event) => {
    event.preventDefault();
    const selectedCoin = coinId || orderedCoins[0]?.id;
    const target = Number(targetPrice);
    if (!selectedCoin || !Number.isFinite(target) || target <= 0) {
      showToast("Elegí una moneda e ingresá un precio mayor que cero.", "error");
      return;
    }
    setIsSaving(true);
    try {
      await createAlert({ coin_id: selectedCoin, condition, target_price: target });
      setCoinId(selectedCoin);
      setTargetPrice("");
      showToast("Alerta creada correctamente.", "success");
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo crear la alerta.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };
  const remove = async (alertId) => {
    if (!window.confirm("¿Eliminar esta alerta?")) return;
    try {
      await removeAlert(alertId);
      showToast("Alerta eliminada.", "success");
    } catch (caughtError) {
      showToast(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo eliminar la alerta.",
        "error",
      );
    }
  };
  return _jsxs("section", {
    "aria-busy": status === "loading" || isSaving,
    "aria-label": "Alertas y notificaciones",
    className: styles.panel,
    children: [
      _jsxs("div", {
        className: styles.header,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", { className: styles.eyebrow, children: "Price watch" }),
              _jsx("h2", { children: "Alertas y notificaciones" }),
              _jsx("p", {
                children:
                  "Defin\u00ED un precio y te avisaremos cuando la moneda entre en esa zona.",
              }),
            ],
          }),
          unreadCount > 0 &&
            _jsxs("span", {
              className: styles.unreadBadge,
              children: [unreadCount, " nuevas"],
            }),
        ],
      }),
      _jsxs("form", {
        className: styles.form,
        onSubmit: submit,
        children: [
          _jsxs("label", {
            children: [
              "Moneda",
              _jsxs("select", {
                value: coinId || orderedCoins[0]?.id || "",
                onChange: (event) => setCoinId(event.target.value),
                children: [
                  _jsx("option", {
                    value: "",
                    disabled: true,
                    children: "Seleccion\u00E1 una moneda",
                  }),
                  orderedCoins.map((coin) =>
                    _jsxs(
                      "option",
                      {
                        value: coin.id,
                        children: [coin.name, " (", coin.symbol.toUpperCase(), ")"],
                      },
                      coin.id,
                    ),
                  ),
                ],
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              "Avisar cuando",
              _jsxs("select", {
                value: condition,
                onChange: (event) => setCondition(event.target.value),
                children: [
                  _jsx("option", { value: "above", children: "supere el precio" }),
                  _jsx("option", { value: "below", children: "baje del precio" }),
                ],
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              "Precio objetivo (USD)",
              _jsx("input", {
                min: "0.00000001",
                required: true,
                step: "any",
                type: "number",
                value: targetPrice,
                onChange: (event) => setTargetPrice(event.target.value),
                placeholder: "Ej. 100000",
              }),
            ],
          }),
          _jsx("button", {
            className: styles.primaryButton,
            disabled: isSaving || orderedCoins.length === 0,
            type: "submit",
            children: isSaving ? "Guardando…" : "Crear alerta",
          }),
        ],
      }),
      error && _jsx("p", { className: styles.error, children: error }),
      _jsxs("div", {
        className: styles.columns,
        children: [
          _jsxs("div", {
            children: [
              _jsxs("div", {
                className: styles.sectionHeader,
                children: [
                  _jsx("h3", { children: "Mis alertas" }),
                  _jsx("span", { children: alerts.length }),
                ],
              }),
              status === "loading" &&
                _jsx("p", {
                  className: styles.empty,
                  children: "Cargando alertas\u2026",
                }),
              status !== "loading" &&
                alerts.length === 0 &&
                _jsx("p", {
                  className: styles.empty,
                  children: "Todav\u00EDa no ten\u00E9s alertas configuradas.",
                }),
              _jsx("div", {
                className: styles.alertList,
                children: alerts.map((alert) =>
                  _jsxs(
                    "article",
                    {
                      className: `${styles.alertItem} ${!alert.is_active ? styles.inactive : ""}`,
                      children: [
                        _jsxs("div", {
                          children: [
                            _jsxs("strong", {
                              children: [
                                alert.name,
                                " ",
                                _jsx("small", { children: alert.symbol.toUpperCase() }),
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                alert.condition === "above" ? "Supera" : "Baja de",
                                " ",
                                money.format(alert.target_price),
                              ],
                            }),
                            _jsx("small", {
                              children:
                                alert.current_price === null
                                  ? "Sin precio actual"
                                  : `Ahora ${money.format(alert.current_price)}`,
                            }),
                          ],
                        }),
                        _jsxs("div", {
                          className: styles.itemActions,
                          children: [
                            _jsx("button", {
                              onClick: () => void toggleAlert(alert),
                              type: "button",
                              children: alert.is_active ? "Pausar" : "Activar",
                            }),
                            _jsx("button", {
                              className: styles.deleteButton,
                              onClick: () => void remove(alert.id),
                              type: "button",
                              children: "Eliminar",
                            }),
                          ],
                        }),
                      ],
                    },
                    alert.id,
                  ),
                ),
              }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsxs("div", {
                className: styles.sectionHeader,
                children: [
                  _jsx("h3", { children: "Centro de avisos" }),
                  unreadCount > 0 &&
                    _jsx("button", {
                      onClick: () => void markAllNotificationsRead(),
                      type: "button",
                      children: "Marcar todo le\u00EDdo",
                    }),
                ],
              }),
              notifications.length === 0 &&
                _jsx("p", {
                  className: styles.empty,
                  children: "Cuando una alerta se cumpla, aparecer\u00E1 aqu\u00ED.",
                }),
              _jsx("div", {
                className: styles.notificationList,
                children: notifications.map((notification) =>
                  _jsxs(
                    "button",
                    {
                      className: `${styles.notification} ${notification.is_read ? styles.read : ""}`,
                      onClick: () =>
                        !notification.is_read &&
                        void markNotificationRead(notification.id),
                      type: "button",
                      children: [
                        _jsx("span", { className: styles.notificationDot }),
                        _jsxs("span", {
                          children: [
                            _jsx("strong", { children: notification.title }),
                            _jsx("small", { children: notification.message }),
                            _jsx("time", {
                              children: dateTime.format(
                                new Date(notification.created_at),
                              ),
                            }),
                          ],
                        }),
                      ],
                    },
                    notification.id,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
