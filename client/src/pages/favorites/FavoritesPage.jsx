import { jsx as _jsx } from "react/jsx-runtime";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
export default function FavoritesPage() {
  return _jsx(DashboardLayout, {
    description:
      "Ten\u00E9 a mano las monedas que m\u00E1s te interesan para seguirlas sin buscarlas.",
    eyebrow: "Favoritos",
    title: "Tus monedas guardadas.",
    children: _jsx(FavoritesPanel, {}),
  });
}
