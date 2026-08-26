import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function ComparePage() {
  return (
    <DashboardLayout
      description="Compara dos monedas en el mismo período para distinguir tendencias relativas."
      eyebrow="Compare / Relative performance"
      title="Poné dos tendencias lado a lado."
    >
      <PriceComparisonPanel />
    </DashboardLayout>
  );
}
