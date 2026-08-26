import { useEffect, useState, type FormEvent } from "react";

import type { PortfolioOperationInput, PortfolioOperationType } from "../../api/types";
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

function getLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function toInputDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function PortfolioPanel() {
  const { coins } = useMarket();
  const {
    createOperation,
    error,
    isLoading,
    isOperationSaving,
    isOperationsLoading,
    isSaving,
    operations,
    operationsSummary,
    portfolio,
    refresh,
    removeHolding,
    removeOperation,
    saveHolding,
    updateOperation,
  } = usePortfolio();
  const { showToast } = useToast();
  const [coinId, setCoinId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averageBuyPrice, setAverageBuyPrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [operationCoinId, setOperationCoinId] = useState("");
  const [operationType, setOperationType] = useState<PortfolioOperationType>("buy");
  const [operationQuantity, setOperationQuantity] = useState("");
  const [operationPrice, setOperationPrice] = useState("");
  const [operationFee, setOperationFee] = useState("0");
  const [operationDate, setOperationDate] = useState(getLocalDateTime);
  const [operationNote, setOperationNote] = useState("");
  const [operationError, setOperationError] = useState<string | null>(null);
  const [editingOperationId, setEditingOperationId] = useState<number | null>(null);
  const [holdingToRemove, setHoldingToRemove] = useState<{
    coinId: string;
    name: string;
  } | null>(null);
  const [operationToRemove, setOperationToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    setCoinId((current) => current || coins[0]?.id || "");
    setOperationCoinId((current) => current || coins[0]?.id || "");
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

  function resetOperationForm() {
    setEditingOperationId(null);
    setOperationQuantity("");
    setOperationPrice("");
    setOperationFee("0");
    setOperationDate(getLocalDateTime());
    setOperationNote("");
    setOperationError(null);
  }

  async function handleOperationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOperationError(null);
    const parsedQuantity = Number(operationQuantity);
    const parsedPrice = Number(operationPrice);
    const parsedFee = Number(operationFee);

    if (
      !operationCoinId ||
      !operationDate ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setOperationError("Ingresa una moneda, fecha y cantidad válidas.");
      return;
    }
    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0 ||
      !Number.isFinite(parsedFee) ||
      parsedFee < 0
    ) {
      setOperationError(
        "El precio debe ser mayor que cero y la comisión no puede ser negativa.",
      );
      return;
    }

    const input: PortfolioOperationInput = {
      coin_id: operationCoinId,
      operation_type: operationType,
      quantity: parsedQuantity,
      price_usd: parsedPrice,
      fee_usd: parsedFee,
      executed_at: new Date(operationDate).toISOString(),
      note: operationNote.trim() || null,
    };
    const saved = editingOperationId
      ? await updateOperation(editingOperationId, input)
      : await createOperation(input);

    if (saved) {
      showToast(
        editingOperationId ? "Operación actualizada." : "Operación registrada.",
        "success",
      );
      resetOperationForm();
    }
  }

  function startEditing(operation: (typeof operations)[number]) {
    setEditingOperationId(operation.id);
    setOperationCoinId(operation.coin_id);
    setOperationType(operation.operation_type);
    setOperationQuantity(String(operation.quantity));
    setOperationPrice(String(operation.price_usd));
    setOperationFee(String(operation.fee_usd));
    setOperationDate(toInputDateTime(operation.executed_at));
    setOperationNote(operation.note || "");
    setOperationError(null);
  }

  async function handleConfirmRemoveHolding() {
    if (!holdingToRemove) return;
    setIsRemoving(true);
    const removed = await removeHolding(holdingToRemove.coinId);
    setIsRemoving(false);
    if (removed) {
      showToast(`Posición de ${holdingToRemove.name} eliminada.`, "success");
      setHoldingToRemove(null);
    }
  }

  async function handleConfirmRemoveOperation() {
    if (!operationToRemove) return;
    setIsRemoving(true);
    const removed = await removeOperation(operationToRemove.id);
    setIsRemoving(false);
    if (removed) {
      showToast(`Operación de ${operationToRemove.name} eliminada.`, "success");
      setOperationToRemove(null);
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
              Puedes guardar una posición rápida o registrar cada compra y venta con su
              fecha, precio, comisión y una nota. Esta cartera no custodia fondos ni
              claves privadas.
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

        <div className={styles.operationSummary}>
          <div>
            <span>Coste de posiciones</span>
            <strong>{formatMoney(operationsSummary?.total_invested ?? 0)}</strong>
          </div>
          <div>
            <span>Beneficio realizado</span>
            <strong className={styles.positive}>
              {formatMoney(operationsSummary?.realized_profit_loss ?? 0)}
            </strong>
          </div>
          <div>
            <span>Beneficio no realizado</span>
            <strong
              className={
                (operationsSummary?.unrealized_profit_loss ?? 0) >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatMoney(operationsSummary?.unrealized_profit_loss ?? null)}
            </strong>
          </div>
        </div>

        <h3 className={styles.subheading}>Posición rápida</h3>
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

        <div className={styles.operationsHeader}>
          <div>
            <h3 className={styles.subheading}>Registro de operaciones</h3>
            <p className={styles.muted}>Compras y ventas declaradas en USD.</p>
          </div>
          {editingOperationId && (
            <Button onClick={resetOperationForm} variant="ghost">
              Cancelar edición
            </Button>
          )}
        </div>
        {operationError && <Alert tone="error">{operationError}</Alert>}
        <form className={styles.operationForm} onSubmit={handleOperationSubmit}>
          <Field id="operation-coin" label="Moneda">
            <select
              disabled={isOperationSaving || coins.length === 0}
              id="operation-coin"
              onChange={(event) => setOperationCoinId(event.target.value)}
              value={operationCoinId}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </Field>
          <Field id="operation-type" label="Tipo">
            <select
              disabled={isOperationSaving}
              id="operation-type"
              onChange={(event) =>
                setOperationType(event.target.value as PortfolioOperationType)
              }
              value={operationType}
            >
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </select>
          </Field>
          <Field id="operation-quantity" label="Cantidad">
            <input
              disabled={isOperationSaving}
              id="operation-quantity"
              min="0"
              step="any"
              onChange={(event) => setOperationQuantity(event.target.value)}
              placeholder="0.10"
              type="number"
              value={operationQuantity}
            />
          </Field>
          <Field id="operation-price" label="Precio USD por unidad">
            <input
              disabled={isOperationSaving}
              id="operation-price"
              min="0"
              step="any"
              onChange={(event) => setOperationPrice(event.target.value)}
              placeholder="40000"
              type="number"
              value={operationPrice}
            />
          </Field>
          <Field id="operation-fee" label="Comisión USD" hint="Opcional">
            <input
              disabled={isOperationSaving}
              id="operation-fee"
              min="0"
              step="any"
              onChange={(event) => setOperationFee(event.target.value)}
              type="number"
              value={operationFee}
            />
          </Field>
          <Field id="operation-date" label="Fecha y hora">
            <input
              disabled={isOperationSaving}
              id="operation-date"
              onChange={(event) => setOperationDate(event.target.value)}
              required
              type="datetime-local"
              value={operationDate}
            />
          </Field>
          <Field id="operation-note" label="Nota" hint="Opcional">
            <input
              disabled={isOperationSaving}
              id="operation-note"
              maxLength={500}
              onChange={(event) => setOperationNote(event.target.value)}
              placeholder="Ej. Compra mensual"
              type="text"
              value={operationNote}
            />
          </Field>
          <Button
            disabled={isOperationSaving || coins.length === 0}
            loading={isOperationSaving}
            type="submit"
          >
            {editingOperationId ? "Guardar cambios" : "Registrar operación"}
          </Button>
        </form>

        {isLoading && <p className={styles.muted}>Cargando posiciones…</p>}
        {!isLoading && portfolio?.holdings.length === 0 && (
          <EmptyState
            description="Agrega una posición rápida o registra una compra para comenzar."
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

        <div className={styles.operationsList}>
          <h3 className={styles.subheading}>Últimas operaciones</h3>
          {isOperationsLoading && <p className={styles.muted}>Cargando operaciones…</p>}
          {!isOperationsLoading && operations.length === 0 && (
            <p className={styles.muted}>Todavía no registraste operaciones.</p>
          )}
          {!isOperationsLoading && operations.length > 0 && (
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Activo</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {operations.map((operation) => (
                    <tr key={operation.id}>
                      <td>
                        {new Date(operation.executed_at).toLocaleDateString("es-AR")}
                      </td>
                      <td>
                        <strong>{operation.name}</strong>
                        <small>{operation.symbol.toUpperCase()}</small>
                      </td>
                      <td>
                        <Badge
                          tone={
                            operation.operation_type === "buy" ? "success" : "danger"
                          }
                        >
                          {operation.operation_type === "buy" ? "Compra" : "Venta"}
                        </Badge>
                      </td>
                      <td>{operation.quantity}</td>
                      <td>
                        {formatMoney(
                          operation.quantity * operation.price_usd + operation.fee_usd,
                        )}
                      </td>
                      <td className={styles.operationActions}>
                        <Button onClick={() => startEditing(operation)} variant="ghost">
                          Editar
                        </Button>
                        <Button
                          onClick={() =>
                            setOperationToRemove({
                              id: operation.id,
                              name: operation.name,
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
        </div>
      </details>

      <ConfirmDialog
        confirmLabel="Eliminar posición"
        description={`Se eliminará la posición de ${holdingToRemove?.name ?? "esta moneda"}. Esta acción no se puede deshacer.`}
        isConfirming={isRemoving}
        onCancel={() => setHoldingToRemove(null)}
        onConfirm={() => void handleConfirmRemoveHolding()}
        open={holdingToRemove !== null}
        title="¿Eliminar esta posición?"
      />
      <ConfirmDialog
        confirmLabel="Eliminar operación"
        description={`Se eliminará la operación de ${operationToRemove?.name ?? "esta moneda"}. Esta acción no se puede deshacer.`}
        isConfirming={isRemoving}
        onCancel={() => setOperationToRemove(null)}
        onConfirm={() => void handleConfirmRemoveOperation()}
        open={operationToRemove !== null}
        title="¿Eliminar esta operación?"
      />
    </>
  );
}
