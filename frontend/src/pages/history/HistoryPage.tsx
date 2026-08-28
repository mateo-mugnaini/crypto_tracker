import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function HistoryPage() {
  return (
    <DashboardLayout
      description="history_description"
      eyebrow="history_eyebrow"
      title="history_title"
    >
      <PriceHistoryPanel />
    </DashboardLayout>
  );
}
