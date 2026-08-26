import { useMemo, useState, type FormEvent } from "react";

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
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const orderedCoins = useMemo(
    () => [...coins].sort((a, b) => a.name.localeCompare(b.name)),
    [coins],
  );

  const submit = async (event: FormEvent) => {
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

  const remove = async (alertId: number) => {
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

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Price watch</span>
          <h2>Alertas y notificaciones</h2>
          <p>Definí un precio y te avisaremos cuando la moneda entre en esa zona.</p>
        </div>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>{unreadCount} nuevas</span>
        )}
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label>
          Moneda
          <select
            value={coinId || orderedCoins[0]?.id || ""}
            onChange={(event) => setCoinId(event.target.value)}
          >
            <option value="" disabled>
              Seleccioná una moneda
            </option>
            {orderedCoins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </label>
        <label>
          Avisar cuando
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value as "above" | "below")}
          >
            <option value="above">supere el precio</option>
            <option value="below">baje del precio</option>
          </select>
        </label>
        <label>
          Precio objetivo (USD)
          <input
            min="0.00000001"
            required
            step="any"
            type="number"
            value={targetPrice}
            onChange={(event) => setTargetPrice(event.target.value)}
            placeholder="Ej. 100000"
          />
        </label>
        <button
          className={styles.primaryButton}
          disabled={isSaving || orderedCoins.length === 0}
          type="submit"
        >
          {isSaving ? "Guardando…" : "Crear alerta"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.columns}>
        <div>
          <div className={styles.sectionHeader}>
            <h3>Mis alertas</h3>
            <span>{alerts.length}</span>
          </div>
          {status === "loading" && <p className={styles.empty}>Cargando alertas…</p>}
          {status !== "loading" && alerts.length === 0 && (
            <p className={styles.empty}>Todavía no tenés alertas configuradas.</p>
          )}
          <div className={styles.alertList}>
            {alerts.map((alert) => (
              <article
                className={`${styles.alertItem} ${!alert.is_active ? styles.inactive : ""}`}
                key={alert.id}
              >
                <div>
                  <strong>
                    {alert.name} <small>{alert.symbol.toUpperCase()}</small>
                  </strong>
                  <p>
                    {alert.condition === "above" ? "Supera" : "Baja de"}{" "}
                    {money.format(alert.target_price)}
                  </p>
                  <small>
                    {alert.current_price === null
                      ? "Sin precio actual"
                      : `Ahora ${money.format(alert.current_price)}`}
                  </small>
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => void toggleAlert(alert)} type="button">
                    {alert.is_active ? "Pausar" : "Activar"}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => void remove(alert.id)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <h3>Centro de avisos</h3>
            {unreadCount > 0 && (
              <button onClick={() => void markAllNotificationsRead()} type="button">
                Marcar todo leído
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p className={styles.empty}>Cuando una alerta se cumpla, aparecerá aquí.</p>
          )}
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <button
                className={`${styles.notification} ${notification.is_read ? styles.read : ""}`}
                key={notification.id}
                onClick={() =>
                  !notification.is_read && void markNotificationRead(notification.id)
                }
                type="button"
              >
                <span className={styles.notificationDot} />
                <span>
                  <strong>{notification.title}</strong>
                  <small>{notification.message}</small>
                  <time>{dateTime.format(new Date(notification.created_at))}</time>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
