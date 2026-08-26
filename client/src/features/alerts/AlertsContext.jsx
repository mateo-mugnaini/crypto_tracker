import { jsx as _jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../auth/AuthContext";
import { api, isRequestCancelled } from "../../api/client";
const AlertsContext = createContext(undefined);
function getMessage(error) {
  return error?.message || "No se pudieron cargar las alertas.";
}
export function AlertsProvider({ children }) {
  const { status: authStatus, token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    if (!token) return;
    setStatus("loading");
    setError(null);
    try {
      const [alertsResponse, notificationsResponse] = await Promise.all([
        api.getAlerts(token),
        api.getNotifications(token),
      ]);
      setAlerts(alertsResponse.data);
      setNotifications(notificationsResponse.data);
      setUnreadCount(notificationsResponse.unread);
      setStatus("ready");
    } catch (caughtError) {
      if (isRequestCancelled(caughtError)) return;
      setError(getMessage(caughtError));
      setStatus("error");
    }
  }, [token]);
  useEffect(() => {
    if (authStatus === "authenticated") void refresh();
    else {
      setAlerts([]);
      setNotifications([]);
      setUnreadCount(0);
      setStatus("idle");
    }
  }, [authStatus, refresh]);
  const createAlert = useCallback(
    async (input) => {
      if (!token) return;
      await api.createAlert(input, token);
      await refresh();
    },
    [refresh, token],
  );
  const toggleAlert = useCallback(
    async (alert) => {
      if (!token) return;
      await api.updateAlert(alert.id, { is_active: !alert.is_active }, token);
      await refresh();
    },
    [refresh, token],
  );
  const removeAlert = useCallback(
    async (alertId) => {
      if (!token) return;
      await api.removeAlert(alertId, token);
      await refresh();
    },
    [refresh, token],
  );
  const markNotificationRead = useCallback(
    async (notificationId) => {
      if (!token) return;
      await api.markNotificationRead(notificationId, token);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    },
    [token],
  );
  const markAllNotificationsRead = useCallback(async () => {
    if (!token) return;
    await api.markAllNotificationsRead(token);
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  }, [token]);
  const value = useMemo(
    () => ({
      alerts,
      notifications,
      unreadCount,
      status,
      error,
      refresh,
      createAlert,
      toggleAlert,
      removeAlert,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      alerts,
      notifications,
      unreadCount,
      status,
      error,
      refresh,
      createAlert,
      toggleAlert,
      removeAlert,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );
  return _jsx(AlertsContext.Provider, { value: value, children: children });
}
export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) throw new Error("useAlerts debe utilizarse dentro de AlertsProvider.");
  return context;
}
export function useOptionalAlerts() {
  return useContext(AlertsContext);
}
