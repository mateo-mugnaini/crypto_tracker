import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import styles from "./LoginPage.module.css";
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice;
  return _jsxs("main", {
    className: styles.layout,
    children: [
      _jsxs("section", {
        className: styles.introPanel,
        children: [
          _jsx("span", {
            className: styles.eyebrow,
            children: "Crypto Tracker / Secure access",
          }),
          _jsx("h1", { children: "Seguimiento cripto, sin ruido." }),
          _jsx("p", {
            children:
              "Lee el mercado con claridad, guarda tus activos relevantes y encuentra contexto en cada movimiento.",
          }),
          _jsxs("div", {
            className: styles.featureList,
            children: [
              _jsx("span", { children: "Datos del mercado" }),
              _jsx("span", { children: "Historial y tendencias" }),
              _jsx("span", { children: "Workspace personal" }),
            ],
          }),
        ],
      }),
      _jsx(LoginForm, { notice: notice, onRegister: () => navigate("/register") }),
    ],
  });
}
