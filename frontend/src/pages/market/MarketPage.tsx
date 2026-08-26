import CoinsPanel from "../../components/dashboard/CoinsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function MarketPage() {
  return (
    <DashboardLayout
      description="Consulta los precios sincronizados y actualiza el valor de una moneda cuando lo necesites."
      eyebrow="Market / Live snapshot"
      title="Explora el mercado."
    >
      <CoinsPanel />
    </DashboardLayout>
  );
}
