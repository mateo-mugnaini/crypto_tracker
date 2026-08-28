import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function FavoritesPage() {
  return (
    <DashboardLayout
      description="favorites_description"
      eyebrow="favorites_eyebrow"
      title="favorites_title"
    >
      <FavoritesPanel />
    </DashboardLayout>
  );
}
