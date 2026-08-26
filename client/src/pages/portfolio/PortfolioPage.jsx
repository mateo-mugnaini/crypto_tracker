import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PortfolioAnalyticsPanel from "../../components/dashboard/PortfolioAnalyticsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
import styles from "../dashboard/DashboardPage.module.css";

export default function PortfolioPage() {
  return (
    <DashboardLayout
      description="Registrá tus posiciones para saber cuánto invertiste y cómo evoluciona su valor."
      eyebrow="Cartera"
      title="Seguí tu inversión."
    >
      <PortfolioPanel />
      <details className={styles.secondarySection}>
        <summary>Ver análisis avanzado de la cartera</summary>
        <PortfolioAnalyticsPanel />
      </details>
    </DashboardLayout>
  );
}
