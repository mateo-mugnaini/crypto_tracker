import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function HistoryPage() {
  return (
    <DashboardLayout
      description="Filtra registros y observa cómo cambió el precio de cada moneda a lo largo del tiempo."
      eyebrow="History / Price movements"
      title="Lee la historia del precio."
    >
      <PriceHistoryPanel />
    </DashboardLayout>
  );
}
