export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number(value) >= 100 ? 2 : 6,
  }).format(Number(value));
}

export function formatNumber(value, maximumFractionDigits = 4) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits }).format(
    Number(value),
  );
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function initials(value = "?") {
  return value.slice(0, 3).toUpperCase();
}

export function displayName(user) {
  return user?.username || user?.email?.split("@")[0] || "ahí";
}
