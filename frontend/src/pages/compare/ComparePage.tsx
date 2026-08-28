import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function ComparePage() {
  return (
    <DashboardLayout
      description="compare_description"
      eyebrow="compare_eyebrow"
      title="compare_title"
    >
      <PriceComparisonPanel />
    </DashboardLayout>
  );
}
