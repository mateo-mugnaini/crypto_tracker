import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./ComparisonChart.module.css";
const WIDTH = 760;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 42, left: 64 };
function formatPercentage(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatDate(value) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}
function normalizeRecords(records) {
  const ordered = [...records].sort(
    (left, right) =>
      new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );
  const basePrice = ordered[0]?.price ?? 0;
  return ordered.map((record) => ({
    time: new Date(record.recorded_at).getTime(),
    value: basePrice === 0 ? 0 : ((record.price - basePrice) / basePrice) * 100,
  }));
}
export default function ComparisonChart({ series }) {
  const normalizedSeries = series.map((item) => ({
    ...item,
    points: normalizeRecords(item.records),
  }));
  const allPoints = normalizedSeries.flatMap((item) => item.points);
  if (allPoints.length === 0) {
    return _jsx("p", {
      className: styles.empty,
      children: "No hay suficientes datos para comparar.",
    });
  }
  const times = allPoints.map((point) => point.time);
  const values = allPoints.map((point) => point.value);
  const minimumTime = Math.min(...times);
  const maximumTime = Math.max(...times);
  const minimumValue = Math.min(0, ...values);
  const maximumValue = Math.max(0, ...values);
  const timeRange = maximumTime - minimumTime || 1;
  const valueRange = maximumValue - minimumValue || 1;
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const getX = (time) => PADDING.left + ((time - minimumTime) / timeRange) * chartWidth;
  const getY = (value) =>
    PADDING.top + chartHeight - ((value - minimumValue) / valueRange) * chartHeight;
  const zeroY = getY(0);
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
                children: "Comparaci\u00F3n normalizada",
              }),
              _jsx("h3", { children: "Variaci\u00F3n desde el primer registro" }),
            ],
          }),
          _jsx("div", {
            className: styles.legend,
            children: normalizedSeries.map((item) =>
              _jsxs(
                "span",
                {
                  children: [
                    _jsx("i", { style: { backgroundColor: item.color } }),
                    item.label,
                  ],
                },
                item.label,
              ),
            ),
          }),
        ],
      }),
      _jsxs("svg", {
        "aria-label": "Comparaci\u00F3n de variaci\u00F3n porcentual entre monedas",
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
            y1: zeroY,
            y2: zeroY,
          }),
          [0, 0.5, 1].map((position) => {
            const value = maximumValue - valueRange * position;
            const y = getY(value);
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
                    x: PADDING.left - 8,
                    y: y + 4,
                    children: formatPercentage(value),
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
            children: formatDate(minimumTime),
          }),
          _jsx("text", {
            className: styles.axisLabel,
            textAnchor: "end",
            x: WIDTH - PADDING.right,
            y: HEIGHT - 12,
            children: formatDate(maximumTime),
          }),
          normalizedSeries.map((item) =>
            _jsx(
              "polyline",
              {
                className: styles.line,
                fill: "none",
                points: item.points
                  .map((point) => `${getX(point.time)},${getY(point.value)}`)
                  .join(" "),
                style: { stroke: item.color },
              },
              item.label,
            ),
          ),
        ],
      }),
    ],
  });
}
