import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
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
function formatMoney(value) {
  return value === null ? "Sin datos" : moneyFormatter.format(value);
}
function formatPercent(value) {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function getLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
function toInputDateTime(value) {
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
  const [formError, setFormError] = useState(null);
  const [operationCoinId, setOperationCoinId] = useState("");
  const [operationType, setOperationType] = useState("buy");
  const [operationQuantity, setOperationQuantity] = useState("");
  const [operationPrice, setOperationPrice] = useState("");
  const [operationFee, setOperationFee] = useState("0");
  const [operationDate, setOperationDate] = useState(getLocalDateTime);
  const [operationNote, setOperationNote] = useState("");
  const [operationError, setOperationError] = useState(null);
  const [editingOperationId, setEditingOperationId] = useState(null);
  const [holdingToRemove, setHoldingToRemove] = useState(null);
  const [operationToRemove, setOperationToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  useEffect(() => {
    setCoinId((current) => current || coins[0]?.id || "");
    setOperationCoinId((current) => current || coins[0]?.id || "");
  }, [coins]);
  async function handleSubmit(event) {
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
  async function handleOperationSubmit(event) {
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
    const input = {
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
  function startEditing(operation) {
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
  return _jsxs(_Fragment, {
    children: [
      _jsxs("details", {
        "aria-busy": isLoading || isSaving || isOperationSaving,
        className: styles.panel,
        "data-dashboard-accordion": "true",
        id: "portfolio",
        open: true,
        children: [
          _jsxs("summary", {
            className: styles.sectionHeading,
            children: [
              _jsxs("div", {
                children: [
                  _jsx("span", { className: styles.eyebrow, children: "Mi cartera" }),
                  _jsx("h2", { children: "Tu cartera personal" }),
                ],
              }),
              _jsxs("div", {
                className: styles.headingActions,
                children: [
                  _jsxs(Badge, {
                    children: [portfolio?.holdings.length ?? 0, " posiciones"],
                  }),
                  _jsxs(HelpTag, {
                    title: "C\u00F3mo funciona la cartera",
                    children: [
                      _jsx("strong", { children: "\u00BFQu\u00E9 debes ingresar?" }),
                      _jsx("br", {}),
                      "Puedes guardar una posici\u00F3n r\u00E1pida o registrar cada compra y venta con su fecha, precio, comisi\u00F3n y una nota. Esta cartera no custodia fondos ni claves privadas.",
                    ],
                  }),
                  _jsx(Button, {
                    disabled: isLoading,
                    loading: isLoading,
                    onClick: (event) => {
                      event.stopPropagation();
                      void refresh();
                    },
                    variant: "secondary",
                    children: "Actualizar",
                  }),
                ],
              }),
            ],
          }),
          _jsx("p", {
            className: styles.description,
            children:
              "Registra tus posiciones para entender cu\u00E1nto invertiste y c\u00F3mo evolucionan. Esta cartera no custodia fondos ni claves privadas.",
          }),
          (error || formError) &&
            _jsx(Alert, { tone: "error", children: error || formError }),
          _jsxs("div", {
            className: styles.summaryGrid,
            children: [
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Invertido" }),
                  _jsx("strong", {
                    children: formatMoney(portfolio?.total_invested ?? 0),
                  }),
                ],
              }),
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Valor actual" }),
                  _jsx("strong", {
                    children: formatMoney(portfolio?.total_current_value ?? null),
                  }),
                ],
              }),
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Rendimiento" }),
                  _jsx("strong", {
                    className:
                      (portfolio?.total_profit_loss ?? 0) >= 0
                        ? styles.positive
                        : styles.negative,
                    children: formatMoney(portfolio?.total_profit_loss ?? null),
                  }),
                  _jsx("small", {
                    children: formatPercent(
                      portfolio?.total_profit_loss_percentage ?? null,
                    ),
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: styles.operationSummary,
            children: [
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Coste de posiciones" }),
                  _jsx("strong", {
                    children: formatMoney(operationsSummary?.total_invested ?? 0),
                  }),
                ],
              }),
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Beneficio realizado" }),
                  _jsx("strong", {
                    className: styles.positive,
                    children: formatMoney(operationsSummary?.realized_profit_loss ?? 0),
                  }),
                ],
              }),
              _jsxs("div", {
                children: [
                  _jsx("span", { children: "Beneficio no realizado" }),
                  _jsx("strong", {
                    className:
                      (operationsSummary?.unrealized_profit_loss ?? 0) >= 0
                        ? styles.positive
                        : styles.negative,
                    children: formatMoney(
                      operationsSummary?.unrealized_profit_loss ?? null,
                    ),
                  }),
                ],
              }),
            ],
          }),
          _jsx("h3", {
            className: styles.subheading,
            children: "Posici\u00F3n r\u00E1pida",
          }),
          _jsxs("form", {
            className: styles.holdingForm,
            onSubmit: handleSubmit,
            children: [
              _jsx(Field, {
                id: "portfolio-coin",
                label: "Moneda",
                children: _jsx("select", {
                  disabled: coins.length === 0 || isSaving,
                  id: "portfolio-coin",
                  onChange: (event) => setCoinId(event.target.value),
                  value: coinId,
                  children: coins.map((coin) =>
                    _jsxs(
                      "option",
                      {
                        value: coin.id,
                        children: [coin.name, " (", coin.symbol.toUpperCase(), ")"],
                      },
                      coin.id,
                    ),
                  ),
                }),
              }),
              _jsx(Field, {
                id: "portfolio-quantity",
                label: "Cantidad",
                children: _jsx("input", {
                  disabled: isSaving,
                  id: "portfolio-quantity",
                  min: "0",
                  onChange: (event) => setQuantity(event.target.value),
                  placeholder: "0.50",
                  step: "any",
                  type: "number",
                  value: quantity,
                }),
              }),
              _jsx(Field, {
                id: "portfolio-average-price",
                label: "Precio medio USD",
                children: _jsx("input", {
                  disabled: isSaving,
                  id: "portfolio-average-price",
                  min: "0",
                  onChange: (event) => setAverageBuyPrice(event.target.value),
                  placeholder: "40000",
                  step: "any",
                  type: "number",
                  value: averageBuyPrice,
                }),
              }),
              _jsx(Button, {
                disabled: isSaving || coins.length === 0,
                loading: isSaving,
                type: "submit",
                children: "Guardar posici\u00F3n",
              }),
            ],
          }),
          _jsxs("details", {
            className: styles.advancedSection,
            children: [
              _jsx("summary", {
                className: styles.advancedSummary,
                children: "Registrar una operación detallada",
              }),
              _jsxs("div", {
                className: styles.advancedSectionContent,
                children: [
                  _jsxs("div", {
                    className: styles.operationsHeader,
                    children: [
                      _jsxs("div", {
                        children: [
                          _jsx("h3", {
                            className: styles.subheading,
                            children: "Registro de operaciones",
                          }),
                          _jsx("p", {
                            className: styles.muted,
                            children: "Compras y ventas declaradas en USD.",
                          }),
                        ],
                      }),
                      editingOperationId &&
                        _jsx(Button, {
                          onClick: resetOperationForm,
                          variant: "ghost",
                          children: "Cancelar edici\u00F3n",
                        }),
                    ],
                  }),
                  operationError &&
                    _jsx(Alert, { tone: "error", children: operationError }),
                  _jsxs("form", {
                    className: styles.operationForm,
                    onSubmit: handleOperationSubmit,
                    children: [
                      _jsx(Field, {
                        id: "operation-coin",
                        label: "Moneda",
                        children: _jsx("select", {
                          disabled: isOperationSaving || coins.length === 0,
                          id: "operation-coin",
                          onChange: (event) => setOperationCoinId(event.target.value),
                          value: operationCoinId,
                          children: coins.map((coin) =>
                            _jsxs(
                              "option",
                              {
                                value: coin.id,
                                children: [
                                  coin.name,
                                  " (",
                                  coin.symbol.toUpperCase(),
                                  ")",
                                ],
                              },
                              coin.id,
                            ),
                          ),
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-type",
                        label: "Tipo",
                        children: _jsxs("select", {
                          disabled: isOperationSaving,
                          id: "operation-type",
                          onChange: (event) => setOperationType(event.target.value),
                          value: operationType,
                          children: [
                            _jsx("option", { value: "buy", children: "Compra" }),
                            _jsx("option", { value: "sell", children: "Venta" }),
                          ],
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-quantity",
                        label: "Cantidad",
                        children: _jsx("input", {
                          disabled: isOperationSaving,
                          id: "operation-quantity",
                          min: "0",
                          step: "any",
                          onChange: (event) => setOperationQuantity(event.target.value),
                          placeholder: "0.10",
                          type: "number",
                          value: operationQuantity,
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-price",
                        label: "Precio USD por unidad",
                        children: _jsx("input", {
                          disabled: isOperationSaving,
                          id: "operation-price",
                          min: "0",
                          step: "any",
                          onChange: (event) => setOperationPrice(event.target.value),
                          placeholder: "40000",
                          type: "number",
                          value: operationPrice,
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-fee",
                        label: "Comisi\u00F3n USD",
                        hint: "Opcional",
                        children: _jsx("input", {
                          disabled: isOperationSaving,
                          id: "operation-fee",
                          min: "0",
                          step: "any",
                          onChange: (event) => setOperationFee(event.target.value),
                          type: "number",
                          value: operationFee,
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-date",
                        label: "Fecha y hora",
                        children: _jsx("input", {
                          disabled: isOperationSaving,
                          id: "operation-date",
                          onChange: (event) => setOperationDate(event.target.value),
                          required: true,
                          type: "datetime-local",
                          value: operationDate,
                        }),
                      }),
                      _jsx(Field, {
                        id: "operation-note",
                        label: "Nota",
                        hint: "Opcional",
                        children: _jsx("input", {
                          disabled: isOperationSaving,
                          id: "operation-note",
                          maxLength: 500,
                          onChange: (event) => setOperationNote(event.target.value),
                          placeholder: "Ej. Compra mensual",
                          type: "text",
                          value: operationNote,
                        }),
                      }),
                      _jsx(Button, {
                        disabled: isOperationSaving || coins.length === 0,
                        loading: isOperationSaving,
                        type: "submit",
                        children: editingOperationId
                          ? "Guardar cambios"
                          : "Registrar operación",
                      }),
                    ],
                  }),
                  isLoading &&
                    _jsx("p", {
                      className: styles.muted,
                      children: "Cargando posiciones\u2026",
                    }),
                  !isLoading &&
                    portfolio?.holdings.length === 0 &&
                    _jsx(EmptyState, {
                      description:
                        "Agrega una posici\u00F3n r\u00E1pida o registra una compra para comenzar.",
                      title: "Tu cartera todav\u00EDa est\u00E1 vac\u00EDa.",
                    }),
                  !isLoading &&
                    Boolean(portfolio?.holdings.length) &&
                    _jsx("div", {
                      className: styles.tableWrapper,
                      children: _jsxs("table", {
                        children: [
                          _jsx("thead", {
                            children: _jsxs("tr", {
                              children: [
                                _jsx("th", { children: "Activo" }),
                                _jsx("th", { children: "Cantidad" }),
                                _jsx("th", { children: "Valor actual" }),
                                _jsx("th", { children: "Resultado" }),
                                _jsx("th", { children: "Peso" }),
                                _jsx("th", {}),
                              ],
                            }),
                          }),
                          _jsx("tbody", {
                            children: portfolio?.holdings.map((holding) =>
                              _jsxs(
                                "tr",
                                {
                                  children: [
                                    _jsxs("td", {
                                      children: [
                                        _jsx("strong", { children: holding.name }),
                                        _jsx("small", {
                                          children: holding.symbol.toUpperCase(),
                                        }),
                                      ],
                                    }),
                                    _jsx("td", { children: holding.quantity }),
                                    _jsx("td", {
                                      children: formatMoney(holding.current_value),
                                    }),
                                    _jsxs("td", {
                                      className:
                                        holding.profit_loss !== null &&
                                        holding.profit_loss >= 0
                                          ? styles.positive
                                          : styles.negative,
                                      children: [
                                        formatMoney(holding.profit_loss),
                                        _jsx("small", {
                                          children: formatPercent(
                                            holding.profit_loss_percentage,
                                          ),
                                        }),
                                      ],
                                    }),
                                    _jsx("td", {
                                      children: formatPercent(
                                        holding.allocation_percentage,
                                      ),
                                    }),
                                    _jsx("td", {
                                      children: _jsx(Button, {
                                        onClick: () =>
                                          setHoldingToRemove({
                                            coinId: holding.coin_id,
                                            name: holding.name,
                                          }),
                                        variant: "danger",
                                        children: "Eliminar",
                                      }),
                                    }),
                                  ],
                                },
                                holding.coin_id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  _jsxs("div", {
                    className: styles.operationsList,
                    children: [
                      _jsx("h3", {
                        className: styles.subheading,
                        children: "\u00DAltimas operaciones",
                      }),
                      isOperationsLoading &&
                        _jsx("p", {
                          className: styles.muted,
                          children: "Cargando operaciones\u2026",
                        }),
                      !isOperationsLoading &&
                        operations.length === 0 &&
                        _jsx("p", {
                          className: styles.muted,
                          children: "Todav\u00EDa no registraste operaciones.",
                        }),
                      !isOperationsLoading &&
                        operations.length > 0 &&
                        _jsx("div", {
                          className: styles.tableWrapper,
                          children: _jsxs("table", {
                            children: [
                              _jsx("thead", {
                                children: _jsxs("tr", {
                                  children: [
                                    _jsx("th", { children: "Fecha" }),
                                    _jsx("th", { children: "Activo" }),
                                    _jsx("th", { children: "Tipo" }),
                                    _jsx("th", { children: "Cantidad" }),
                                    _jsx("th", { children: "Total" }),
                                    _jsx("th", {}),
                                  ],
                                }),
                              }),
                              _jsx("tbody", {
                                children: operations.map((operation) =>
                                  _jsxs(
                                    "tr",
                                    {
                                      children: [
                                        _jsx("td", {
                                          children: new Date(
                                            operation.executed_at,
                                          ).toLocaleDateString("es-AR"),
                                        }),
                                        _jsxs("td", {
                                          children: [
                                            _jsx("strong", {
                                              children: operation.name,
                                            }),
                                            _jsx("small", {
                                              children: operation.symbol.toUpperCase(),
                                            }),
                                          ],
                                        }),
                                        _jsx("td", {
                                          children: _jsx(Badge, {
                                            tone:
                                              operation.operation_type === "buy"
                                                ? "success"
                                                : "danger",
                                            children:
                                              operation.operation_type === "buy"
                                                ? "Compra"
                                                : "Venta",
                                          }),
                                        }),
                                        _jsx("td", { children: operation.quantity }),
                                        _jsx("td", {
                                          children: formatMoney(
                                            operation.quantity * operation.price_usd +
                                              operation.fee_usd,
                                          ),
                                        }),
                                        _jsxs("td", {
                                          className: styles.operationActions,
                                          children: [
                                            _jsx(Button, {
                                              onClick: () => startEditing(operation),
                                              variant: "ghost",
                                              children: "Editar",
                                            }),
                                            _jsx(Button, {
                                              onClick: () =>
                                                setOperationToRemove({
                                                  id: operation.id,
                                                  name: operation.name,
                                                }),
                                              variant: "danger",
                                              children: "Eliminar",
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    operation.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx(ConfirmDialog, {
        confirmLabel: "Eliminar posici\u00F3n",
        description: `Se eliminará la posición de ${holdingToRemove?.name ?? "esta moneda"}. Esta acción no se puede deshacer.`,
        isConfirming: isRemoving,
        onCancel: () => setHoldingToRemove(null),
        onConfirm: () => void handleConfirmRemoveHolding(),
        open: holdingToRemove !== null,
        title: "\u00BFEliminar esta posici\u00F3n?",
      }),
      _jsx(ConfirmDialog, {
        confirmLabel: "Eliminar operaci\u00F3n",
        description: `Se eliminará la operación de ${operationToRemove?.name ?? "esta moneda"}. Esta acción no se puede deshacer.`,
        isConfirming: isRemoving,
        onCancel: () => setOperationToRemove(null),
        onConfirm: () => void handleConfirmRemoveOperation(),
        open: operationToRemove !== null,
        title: "\u00BFEliminar esta operaci\u00F3n?",
      }),
    ],
  });
}
