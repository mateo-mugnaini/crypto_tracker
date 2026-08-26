import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function FavoritesPage() {
  return (
    <DashboardLayout
      description="Tené a mano las monedas que más te interesan para seguirlas sin buscarlas."
      eyebrow="Favorites / Watchlist"
      title="Tu selección personal."
    >
      <FavoritesPanel />
    </DashboardLayout>
  );
}
