import MarketExplorer from "../../components/market/MarketExplorer";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function MarketPage() {
  return (
    <DashboardLayout
      description="Consulta los precios sincronizados y actualiza el valor de una moneda cuando lo necesites."
      eyebrow="Market / Live snapshot"
      title="Explora el mercado."
    >
      <MarketExplorer />
    </DashboardLayout>
  );
}
