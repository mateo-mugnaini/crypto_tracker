import { jsx as _jsx } from "react/jsx-runtime";
import MarketExplorer from "../../components/market/MarketExplorer";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function MarketPage() {
  return _jsx(DashboardLayout, {
    description:
      "Consulta los precios sincronizados y actualiza el valor de una moneda cuando lo necesites.",
    eyebrow: "Mercado",
    title: "Buscá una moneda.",
    children: _jsx(MarketExplorer, {}),
  });
}
