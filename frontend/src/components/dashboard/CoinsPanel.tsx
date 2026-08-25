import { useEffect, useState } from "react";

import { ApiError, api } from "../../api/client";
import type { Coin } from "../../api/types";
import styles from "./CoinsPanel.module.css";

export default function CoinsPanel() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCoins()
      .then((response) => setCoins(response.data))
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar las monedas.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Mercado local</span>
          <h2>Monedas sincronizadas</h2>
        </div>
        <span className={styles.pill}>{coins.length} monedas</span>
      </div>

      {isLoading && <p className={styles.muted}>Cargando monedas…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!isLoading && !error && coins.length === 0 && (
        <p className={styles.muted}>Todavía no hay monedas sincronizadas.</p>
      )}

      <div className={styles.coinGrid}>
        {coins.map((coin) => (
          <article className={styles.coinCard} key={coin.id}>
            <div className={styles.coinIcon}>{coin.symbol.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{coin.name}</strong>
              <span>{coin.symbol.toUpperCase()}</span>
            </div>
            <small>#{coin.market_cap_rank ?? "—"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
