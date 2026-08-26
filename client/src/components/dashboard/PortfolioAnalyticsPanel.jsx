import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import styles from "./PortfolioAnalyticsPanel.module.css";
const WIDTH = 760;
const HEIGHT = 280;
const PAD = { top: 24, right: 24, bottom: 42, left: 72 };
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
function formatMoney(value) {
  return value === null ? "—" : money.format(value);
}
function formatPercent(value) {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function csvCell(value) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
export default function PortfolioAnalyticsPanel() {
  const { token } = useAuth();
  const { coins } = useMarket();
  const [days, setDays] = useState(30);
  const [benchmark, setBenchmark] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadAnalytics = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      setAnalytics(
        await api.getPortfolioAnalytics(days, token, benchmark || undefined),
      );
    } catch (caughtError) {
      if (!isRequestCancelled(caughtError)) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar la analítica.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    void loadAnalytics();
    // La carga es manual después de cambiar período para evitar peticiones por cada snapshot live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  const chart = useMemo(() => {
    const points = analytics?.points || [];
    if (!points.length) return null;
    const values = points.map((point) => point.value);
    const maximum = Math.max(...values, ...points.map((point) => point.invested), 1);
    const minimum = Math.min(...values, ...points.map((point) => point.invested), 0);
    const range = maximum - minimum || 1;
    const width = WIDTH - PAD.left - PAD.right;
    const height = HEIGHT - PAD.top - PAD.bottom;
    const pointAt = (value, index) =>
      `${PAD.left + (index / Math.max(points.length - 1, 1)) * width},${PAD.top + height - ((value - minimum) / range) * height}`;
    return {
      valuePoints: points.map((point, index) => pointAt(point.value, index)).join(" "),
      investedPoints: points
        .map((point, index) => pointAt(point.invested, index))
        .join(" "),
      maximum,
      minimum,
    };
  }, [analytics]);
  const downloadCsv = () => {
    if (!analytics) return;
    const rows = [
      ["timestamp", "portfolio_value_usd", "invested_usd"],
      ...analytics.points.map((point) => [
        point.timestamp,
        point.value,
        point.invested,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crypto-tracker-cartera-${analytics.period_days}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return _jsxs("section", {
    className: styles.panel,
    children: [
      _jsxs("div", {
        className: styles.header,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", {
                className: styles.eyebrow,
                children: "Análisis de cartera",
              }),
              _jsx("h2", { children: "C\u00F3mo evoluciona tu cartera" }),
              _jsx("p", {
                children:
                  "Las cifras usan tus operaciones y los snapshots guardados; no son una recomendaci\u00F3n financiera.",
              }),
            ],
          }),
          _jsxs("div", {
            className: styles.controls,
            children: [
              _jsxs("label", {
                children: [
                  "Per\u00EDodo",
                  _jsxs("select", {
                    value: days,
                    onChange: (event) => setDays(Number(event.target.value)),
                    children: [
                      _jsx("option", { value: 7, children: "7 d\u00EDas" }),
                      _jsx("option", { value: 30, children: "30 d\u00EDas" }),
                      _jsx("option", { value: 90, children: "90 d\u00EDas" }),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Comparar con",
                  _jsxs("select", {
                    value: benchmark,
                    onChange: (event) => setBenchmark(event.target.value),
                    children: [
                      _jsx("option", { value: "", children: "Sin benchmark" }),
                      coins
                        .filter(
                          (coin) => coin.id === "bitcoin" || coin.id === "ethereum",
                        )
                        .map((coin) =>
                          _jsx(
                            "option",
                            { value: coin.id, children: coin.name },
                            coin.id,
                          ),
                        ),
                    ],
                  }),
                ],
              }),
              _jsx("button", {
                onClick: () => void loadAnalytics(),
                type: "button",
                children: isLoading ? "Cargando…" : "Actualizar",
              }),
            ],
          }),
        ],
      }),
      error && _jsx("p", { className: styles.error, children: error }),
      analytics &&
        _jsxs(_Fragment, {
          children: [
            _jsxs("div", {
              className: styles.metrics,
              children: [
                _jsxs("div", {
                  children: [
                    _jsx("span", { children: "Variaci\u00F3n del valor" }),
                    _jsx("strong", {
                      children: formatPercent(analytics.total_return_percentage),
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("span", { children: "Drawdown m\u00E1ximo" }),
                    _jsx("strong", {
                      children: formatPercent(analytics.max_drawdown_percentage),
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("span", { children: "Volatilidad descriptiva" }),
                    _jsx("strong", {
                      children: formatPercent(analytics.volatility_percentage),
                    }),
                  ],
                }),
                _jsxs("div", {
                  children: [
                    _jsx("span", { children: "Snapshots" }),
                    _jsx("strong", { children: analytics.points.length }),
                  ],
                }),
              ],
            }),
            chart
              ? _jsxs("div", {
                  className: styles.chartBlock,
                  children: [
                    _jsxs("div", {
                      className: styles.chartLegend,
                      children: [
                        _jsxs("span", {
                          children: [
                            _jsx("i", { className: styles.valueLegend }),
                            "Valor de cartera",
                          ],
                        }),
                        _jsxs("span", {
                          children: [
                            _jsx("i", { className: styles.investedLegend }),
                            "Costo invertido",
                          ],
                        }),
                        analytics.benchmark_coin_id &&
                          _jsxs("span", {
                            children: ["Benchmark: ", analytics.benchmark_coin_id],
                          }),
                      ],
                    }),
                    _jsxs("svg", {
                      "aria-label": "Evoluci\u00F3n del valor de la cartera",
                      className: styles.chart,
                      role: "img",
                      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
                      children: [
                        _jsx("line", {
                          className: styles.axis,
                          x1: PAD.left,
                          x2: PAD.left,
                          y1: PAD.top,
                          y2: HEIGHT - PAD.bottom,
                        }),
                        _jsx("line", {
                          className: styles.axis,
                          x1: PAD.left,
                          x2: WIDTH - PAD.right,
                          y1: HEIGHT - PAD.bottom,
                          y2: HEIGHT - PAD.bottom,
                        }),
                        _jsx("text", {
                          className: styles.axisLabel,
                          x: PAD.left - 8,
                          y: PAD.top + 4,
                          children: formatMoney(chart.maximum),
                        }),
                        _jsx("text", {
                          className: styles.axisLabel,
                          x: PAD.left - 8,
                          y: HEIGHT - PAD.bottom,
                          children: formatMoney(chart.minimum),
                        }),
                        _jsx("polyline", {
                          className: styles.valueLine,
                          fill: "none",
                          points: chart.valuePoints,
                        }),
                        _jsx("polyline", {
                          className: styles.investedLine,
                          fill: "none",
                          points: chart.investedPoints,
                        }),
                      ],
                    }),
                  ],
                })
              : _jsx("p", {
                  className: styles.empty,
                  children:
                    "Todav\u00EDa no hay snapshots suficientes para dibujar la evoluci\u00F3n.",
                }),
            _jsxs("div", {
              className: styles.tableHeader,
              children: [
                _jsx("h3", { children: "Detalle por activo" }),
                _jsx("button", {
                  onClick: downloadCsv,
                  type: "button",
                  children: "Descargar CSV",
                }),
              ],
            }),
            analytics.assets.length === 0
              ? _jsx("p", {
                  className: styles.empty,
                  children:
                    "Registr\u00E1 al menos una operaci\u00F3n para ver el an\u00E1lisis.",
                })
              : _jsx("div", {
                  className: styles.tableWrapper,
                  children: _jsxs("table", {
                    children: [
                      _jsx("caption", {
                        className: styles.visuallyHidden,
                        children: "Rendimiento actual de cada activo de la cartera",
                      }),
                      _jsx("thead", {
                        children: _jsxs("tr", {
                          children: [
                            _jsx("th", { children: "Activo" }),
                            _jsx("th", { children: "Invertido" }),
                            _jsx("th", { children: "Valor actual" }),
                            _jsx("th", { children: "Resultado" }),
                            _jsx("th", { children: "Distribuci\u00F3n" }),
                          ],
                        }),
                      }),
                      _jsx("tbody", {
                        children: analytics.assets.map((asset) =>
                          _jsxs(
                            "tr",
                            {
                              children: [
                                _jsxs("th", {
                                  scope: "row",
                                  children: [
                                    asset.name,
                                    " ",
                                    _jsx("small", {
                                      children: asset.symbol.toUpperCase(),
                                    }),
                                  ],
                                }),
                                _jsx("td", { children: formatMoney(asset.invested) }),
                                _jsx("td", {
                                  children: formatMoney(asset.current_value),
                                }),
                                _jsxs("td", {
                                  className:
                                    asset.profit_loss !== null && asset.profit_loss >= 0
                                      ? styles.positive
                                      : styles.negative,
                                  children: [
                                    formatMoney(asset.profit_loss),
                                    " ",
                                    _jsx("small", {
                                      children: formatPercent(
                                        asset.profit_loss_percentage,
                                      ),
                                    }),
                                  ],
                                }),
                                _jsx("td", {
                                  children: formatPercent(asset.allocation_percentage),
                                }),
                              ],
                            },
                            asset.coin_id,
                          ),
                        ),
                      }),
                    ],
                  }),
                }),
          ],
        }),
    ],
  });
}
