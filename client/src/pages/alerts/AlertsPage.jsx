import { jsx as _jsx } from "react/jsx-runtime";
import AlertsPanel from "../../components/dashboard/AlertsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function AlertsPage() {
  return _jsx(DashboardLayout, {
    description:
      "Configur\u00E1 avisos para enterarte cuando una moneda alcance el precio que te interesa.",
    eyebrow: "Workspace / Price watch",
    title: "Vigil\u00E1 el mercado.",
    children: _jsx(AlertsPanel, {}),
  });
}
