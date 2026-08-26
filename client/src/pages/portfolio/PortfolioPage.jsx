import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PortfolioAnalyticsPanel from "../../components/dashboard/PortfolioAnalyticsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function PortfolioPage() {
  return _jsxs(DashboardLayout, {
    description:
      "Registra tus posiciones para conocer cu\u00E1nto invertiste y c\u00F3mo evoluciona su valor.",
    eyebrow: "Cartera",
    title: "Seguí tu inversión.",
    children: [_jsx(PortfolioPanel, {}), _jsx(PortfolioAnalyticsPanel, {})],
  });
}
