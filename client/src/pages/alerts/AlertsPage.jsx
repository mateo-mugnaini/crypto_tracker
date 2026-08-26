import { jsx as _jsx } from "react/jsx-runtime";
import AlertsPanel from "../../components/dashboard/AlertsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function AlertsPage() {
  return _jsx(DashboardLayout, {
    description:
      "Configur\u00E1 avisos para enterarte cuando una moneda alcance el precio que te interesa.",
    eyebrow: "Alertas",
    title: "Dej\u00E1 que te avisemos.",
    children: _jsx(AlertsPanel, {}),
  });
}
