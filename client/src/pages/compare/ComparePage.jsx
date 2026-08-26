import { jsx as _jsx } from "react/jsx-runtime";
import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function ComparePage() {
  return _jsx(DashboardLayout, {
    description:
      "Compara dos monedas en el mismo per\u00EDodo para distinguir tendencias relativas.",
    eyebrow: "Compare / Relative performance",
    title: "Pon\u00E9 dos tendencias lado a lado.",
    children: _jsx(PriceComparisonPanel, {}),
  });
}
