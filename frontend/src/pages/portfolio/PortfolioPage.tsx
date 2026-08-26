import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function PortfolioPage() {
  return (
    <DashboardLayout
      description="Registra tus posiciones para conocer cuánto invertiste y cómo evoluciona su valor."
      eyebrow="Portfolio / Personal tracking"
      title="Entiende tu cartera."
    >
      <PortfolioPanel />
    </DashboardLayout>
  );
}
