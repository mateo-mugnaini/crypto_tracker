import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import styles from "./RegisterPage.module.css";
export default function RegisterPage() {
  const navigate = useNavigate();
  return _jsxs("main", {
    className: styles.layout,
    children: [
      _jsxs("section", {
        className: styles.introPanel,
        children: [
          _jsx("span", {
            className: styles.eyebrow,
            children: "Crypto Tracker / Create account",
          }),
          _jsx("h1", { children: "Tu mercado empieza aqu\u00ED." }),
          _jsx("p", {
            children:
              "Crea tu espacio personal para seguir favoritos, revisar precios y analizar la evoluci\u00F3n de tus monedas.",
          }),
          _jsxs("div", {
            className: styles.featureList,
            children: [
              _jsx("span", { children: "Cuenta propia" }),
              _jsx("span", { children: "Datos persistentes" }),
              _jsx("span", { children: "Acceso seguro" }),
            ],
          }),
        ],
      }),
      _jsx(RegisterForm, {
        onLogin: () => navigate("/login"),
        onRegistered: () =>
          navigate("/login", {
            replace: true,
            state: { notice: "Cuenta creada. Ya puedes iniciar sesión." },
          }),
      }),
    ],
  });
}
