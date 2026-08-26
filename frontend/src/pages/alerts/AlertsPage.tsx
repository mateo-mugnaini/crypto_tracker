import AlertsPanel from "../../components/dashboard/AlertsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function AlertsPage() {
  return (
    <DashboardLayout
      description="Configurá avisos para enterarte cuando una moneda alcance el precio que te interesa."
      eyebrow="Workspace / Price watch"
      title="Vigilá el mercado."
    >
      <AlertsPanel />
    </DashboardLayout>
  );
}
