import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./PriceHistoryChart.module.css";
const WIDTH = 760;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 42, left: 72 };
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
function formatPrice(value) {
  return moneyFormatter.format(value);
}
function formatDate(value) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}
export default function PriceHistoryChart({ records }) {
  if (records.length === 0) {
    return _jsx("p", {
      className: styles.empty,
      children: "No hay datos para graficar.",
    });
  }
  const orderedRecords = [...records].sort(
    (left, right) =>
      new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );
  const prices = orderedRecords.map((record) => record.price);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const range = maximum - minimum || Math.max(maximum * 0.01, 1);
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const getX = (index) =>
    PADDING.left + (index / Math.max(orderedRecords.length - 1, 1)) * chartWidth;
  const getY = (price) =>
    PADDING.top + chartHeight - ((price - minimum) / range) * chartHeight;
  const points = orderedRecords
    .map((record, index) => `${getX(index)},${getY(record.price)}`)
    .join(" ");
  const middleValue = minimum + range / 2;
  return _jsxs("div", {
    className: styles.chartWrapper,
    children: [
      _jsxs("div", {
        className: styles.chartHeader,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", {
                className: styles.eyebrow,
                children: "Tendencia temporal",
              }),
              _jsx("h3", { children: "Evoluci\u00F3n del precio" }),
            ],
          }),
          _jsxs("span", {
            className: styles.rangeLabel,
            children: [formatPrice(minimum), " \u2014 ", formatPrice(maximum)],
          }),
        ],
      }),
      _jsxs("svg", {
        "aria-label": "Gr\u00E1fico de evoluci\u00F3n del precio",
        className: styles.chart,
        role: "img",
        viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
        children: [
          _jsx("line", {
            className: styles.axis,
            x1: PADDING.left,
            x2: PADDING.left,
            y1: PADDING.top,
            y2: HEIGHT - PADDING.bottom,
          }),
          _jsx("line", {
            className: styles.axis,
            x1: PADDING.left,
            x2: WIDTH - PADDING.right,
            y1: HEIGHT - PADDING.bottom,
            y2: HEIGHT - PADDING.bottom,
          }),
          [0, 0.5, 1].map((position) => {
            const y = PADDING.top + chartHeight * position;
            const value = maximum - range * position;
            return _jsxs(
              "g",
              {
                children: [
                  _jsx("line", {
                    className: styles.gridLine,
                    x1: PADDING.left,
                    x2: WIDTH - PADDING.right,
                    y1: y,
                    y2: y,
                  }),
                  _jsx("text", {
                    className: styles.axisLabel,
                    x: PADDING.left - 10,
                    y: y + 4,
                    children: formatPrice(value),
                  }),
                ],
              },
              position,
            );
          }),
          _jsx("text", {
            className: styles.axisLabel,
            x: PADDING.left,
            y: HEIGHT - 12,
            children: formatDate(orderedRecords[0].recorded_at),
          }),
          _jsx("text", {
            className: styles.axisLabel,
            textAnchor: "end",
            x: WIDTH - PADDING.right,
            y: HEIGHT - 12,
            children: formatDate(orderedRecords[orderedRecords.length - 1].recorded_at),
          }),
          _jsx("polyline", { className: styles.line, fill: "none", points: points }),
          orderedRecords.map((record, index) =>
            _jsx(
              "circle",
              {
                className: styles.point,
                cx: getX(index),
                cy: getY(record.price),
                r: "4",
                children: _jsxs("title", {
                  children: [
                    formatDate(record.recorded_at),
                    ": ",
                    formatPrice(record.price),
                  ],
                }),
              },
              `${record.id ?? record.recorded_at}-${record.price}`,
            ),
          ),
          _jsx("text", {
            className: styles.middleLabel,
            x: WIDTH - PADDING.right,
            y: PADDING.top + chartHeight / 2 + 4,
            children: formatPrice(middleValue),
          }),
        ],
      }),
    ],
  });
}
