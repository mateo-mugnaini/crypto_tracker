import { useEffect, useState, type FormEvent } from "react";

import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";
import Field from "../ui/Field";
import { useToast } from "../ui/ToastProvider";
import { useMarket } from "../../features/market/MarketContext";
import { usePortfolio } from "../../features/portfolio/PortfolioContext";
import HelpTag from "./HelpTag";
import styles from "./PortfolioPanel.module.css";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatMoney(value: number | null) {
  return value === null ? "Sin datos" : moneyFormatter.format(value);
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function PortfolioPanel() {
  const { coins } = useMarket();
  const { error, isLoading, isSaving, portfolio, refresh, removeHolding, saveHolding } =
    usePortfolio();
  const { showToast } = useToast();
  const [coinId, setCoinId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averageBuyPrice, setAverageBuyPrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [holdingToRemove, setHoldingToRemove] = useState<{
    coinId: string;
    name: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setCoinId((current) => current || coins[0]?.id || "");
  }, [coins]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsedQuantity = Number(quantity);
    const parsedAverageBuyPrice = Number(averageBuyPrice);

    if (!coinId || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFormError("Ingresa una cantidad válida.");
      return;
    }

    if (!Number.isFinite(parsedAverageBuyPrice) || parsedAverageBuyPrice <= 0) {
      setFormError("Ingresa un precio medio de compra válido.");
      return;
    }

    const saved = await saveHolding({
      coin_id: coinId,
      quantity: parsedQuantity,
      average_buy_price: parsedAverageBuyPrice,
    });

    if (saved) {
      setQuantity("");
      setAverageBuyPrice("");
      showToast("Posición guardada correctamente.", "success");
    }
  }

  async function handleConfirmRemove() {
    if (!holdingToRemove) return;

    setIsRemoving(true);
    const removed = await removeHolding(holdingToRemove.coinId);
    setIsRemoving(false);

    if (removed) {
      showToast(`Posición de ${holdingToRemove.name} eliminada.`, "success");
      setHoldingToRemove(null);
    }
  }

  return (
    <>
      <details
        className={styles.panel}
        data-dashboard-accordion="true"
        id="portfolio"
        open
      >
        <summary className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>My portfolio</span>
            <h2>Tu cartera personal</h2>
          </div>
          <div className={styles.headingActions}>
            <Badge>{portfolio?.holdings.length ?? 0} posiciones</Badge>
            <HelpTag title="Cómo funciona la cartera">
              <strong>¿Qué debes ingresar?</strong>
              <br />
              Selecciona una moneda, indica cuántas unidades tienes y escribe el precio
              medio que pagaste por cada una. El valor actual se obtiene del último
              precio disponible.
            </HelpTag>
            <Button
              disabled={isLoading}
              loading={isLoading}
              onClick={(event) => {
                event.stopPropagation();
                void refresh();
              }}
              variant="secondary"
            >
              Actualizar
            </Button>
          </div>
        </summary>

        <p className={styles.description}>
          Registra tus posiciones para entender cuánto invertiste y cómo evolucionan.
          Esta cartera no custodia fondos ni claves privadas.
        </p>

        {(error || formError) && <Alert tone="error">{error || formError}</Alert>}

        <div className={styles.summaryGrid}>
          <div>
            <span>Invertido</span>
            <strong>{formatMoney(portfolio?.total_invested ?? 0)}</strong>
          </div>
          <div>
            <span>Valor actual</span>
            <strong>{formatMoney(portfolio?.total_current_value ?? null)}</strong>
          </div>
          <div>
            <span>Rendimiento</span>
            <strong
              className={
                (portfolio?.total_profit_loss ?? 0) >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatMoney(portfolio?.total_profit_loss ?? null)}
            </strong>
            <small>
              {formatPercent(portfolio?.total_profit_loss_percentage ?? null)}
            </small>
          </div>
        </div>

        <form className={styles.holdingForm} onSubmit={handleSubmit}>
          <Field id="portfolio-coin" label="Moneda">
            <select
              disabled={coins.length === 0 || isSaving}
              id="portfolio-coin"
              onChange={(event) => setCoinId(event.target.value)}
              value={coinId}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </Field>
          <Field id="portfolio-quantity" label="Cantidad">
            <input
              disabled={isSaving}
              id="portfolio-quantity"
              min="0"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="0.50"
              step="any"
              type="number"
              value={quantity}
            />
          </Field>
          <Field id="portfolio-average-price" label="Precio medio USD">
            <input
              disabled={isSaving}
              id="portfolio-average-price"
              min="0"
              onChange={(event) => setAverageBuyPrice(event.target.value)}
              placeholder="40000"
              step="any"
              type="number"
              value={averageBuyPrice}
            />
          </Field>
          <Button
            disabled={isSaving || coins.length === 0}
            loading={isSaving}
            type="submit"
          >
            Guardar posición
          </Button>
        </form>

        {isLoading && <p className={styles.muted}>Cargando posiciones…</p>}
        {!isLoading && portfolio?.holdings.length === 0 && (
          <EmptyState
            description="Agrega una posición para comenzar a medir tu rendimiento."
            title="Tu cartera todavía está vacía."
          />
        )}

        {!isLoading && Boolean(portfolio?.holdings.length) && (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Cantidad</th>
                  <th>Valor actual</th>
                  <th>Resultado</th>
                  <th>Peso</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {portfolio?.holdings.map((holding) => (
                  <tr key={holding.coin_id}>
                    <td>
                      <strong>{holding.name}</strong>
                      <small>{holding.symbol.toUpperCase()}</small>
                    </td>
                    <td>{holding.quantity}</td>
                    <td>{formatMoney(holding.current_value)}</td>
                    <td
                      className={
                        holding.profit_loss !== null && holding.profit_loss >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {formatMoney(holding.profit_loss)}
                      <small>{formatPercent(holding.profit_loss_percentage)}</small>
                    </td>
                    <td>{formatPercent(holding.allocation_percentage)}</td>
                    <td>
                      <Button
                        onClick={() =>
                          setHoldingToRemove({
                            coinId: holding.coin_id,
                            name: holding.name,
                          })
                        }
                        variant="danger"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <ConfirmDialog
        confirmLabel="Eliminar posición"
        description={`Se eliminará la posición de ${holdingToRemove?.name ?? "esta moneda"}. Esta acción no se puede deshacer.`}
        isConfirming={isRemoving}
        onCancel={() => setHoldingToRemove(null)}
        onConfirm={() => void handleConfirmRemove()}
        open={holdingToRemove !== null}
        title="¿Eliminar esta posición?"
      />
    </>
  );
}
