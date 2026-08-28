import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PortfolioAnalyticsPanel from "../../components/dashboard/PortfolioAnalyticsPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function PortfolioPage() {
  return (
    <DashboardLayout
      description="portfolio_description"
      eyebrow="portfolio_eyebrow"
      title="portfolio_title"
    >
      <PortfolioPanel />
      <PortfolioAnalyticsPanel />
    </DashboardLayout>
  );
}
