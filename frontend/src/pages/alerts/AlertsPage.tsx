import AlertsPanel from "../../components/dashboard/AlertsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function AlertsPage() {
  return (
    <DashboardLayout
      description="alerts_description"
      eyebrow="alerts_eyebrow"
      title="alerts_title"
    >
      <AlertsPanel />
    </DashboardLayout>
  );
}
