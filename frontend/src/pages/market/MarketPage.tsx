import MarketExplorer from "../../components/market/MarketExplorer";
import { useI18n } from "../../i18n/I18nContext";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function MarketPage() {
  const { t } = useI18n();
  return (
    <DashboardLayout
      description={t("market_description")}
      eyebrow="market_eyebrow"
      title="market_title"
    >
      <MarketExplorer />
    </DashboardLayout>
  );
}
