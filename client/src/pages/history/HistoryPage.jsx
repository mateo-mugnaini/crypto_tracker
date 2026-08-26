import { jsx as _jsx } from "react/jsx-runtime";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function HistoryPage() {
  return _jsx(DashboardLayout, {
    description:
      "Filtra registros y observa c\u00F3mo cambi\u00F3 el precio de cada moneda a lo largo del tiempo.",
    eyebrow: "History / Price movements",
    title: "Lee la historia del precio.",
    children: _jsx(PriceHistoryPanel, {}),
  });
}
