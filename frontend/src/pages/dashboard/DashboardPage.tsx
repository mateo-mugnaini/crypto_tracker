import CoinsPanel from "../../components/dashboard/CoinsPanel";
import Topbar from "../../components/dashboard/Topbar";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  return (
    <>
      <Topbar />

      <main className={styles.dashboard}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Dashboard</span>
            <h1>Tu mercado cripto, claro y cerca.</h1>
            <p>
              Esta primera pantalla ya consume el backend real y prepara el
              terreno para favoritos, historial y gráficos.
            </p>
          </div>
          <div className={styles.heroOrbit} aria-hidden="true">
            <span>₿</span>
          </div>
        </section>

        <CoinsPanel />
      </main>
    </>
  );
}
