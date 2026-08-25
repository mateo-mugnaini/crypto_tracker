import type { PriceHistoryRecord } from "../../api/types";
import styles from "./PriceHistoryChart.module.css";

interface PriceHistoryChartProps {
  records: PriceHistoryRecord[];
}

const WIDTH = 760;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 42, left: 72 };

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPrice(value: number) {
  return moneyFormatter.format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

export default function PriceHistoryChart({ records }: PriceHistoryChartProps) {
  if (records.length === 0) {
    return <p className={styles.empty}>No hay datos para graficar.</p>;
  }

  const orderedRecords = [...records].sort(
    (left, right) =>
      new Date(left.recorded_at).getTime() -
      new Date(right.recorded_at).getTime(),
  );
  const prices = orderedRecords.map((record) => record.price);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const range = maximum - minimum || Math.max(maximum * 0.01, 1);
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const getX = (index: number) =>
    PADDING.left +
    (index / Math.max(orderedRecords.length - 1, 1)) * chartWidth;
  const getY = (price: number) =>
    PADDING.top + chartHeight - ((price - minimum) / range) * chartHeight;

  const points = orderedRecords
    .map((record, index) => `${getX(index)},${getY(record.price)}`)
    .join(" ");
  const middleValue = minimum + range / 2;

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <div>
          <span className={styles.eyebrow}>Tendencia temporal</span>
          <h3>Evolución del precio</h3>
        </div>
        <span className={styles.rangeLabel}>
          {formatPrice(minimum)} — {formatPrice(maximum)}
        </span>
      </div>

      <svg
        aria-label="Gráfico de evolución del precio"
        className={styles.chart}
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      >
        <line
          className={styles.axis}
          x1={PADDING.left}
          x2={PADDING.left}
          y1={PADDING.top}
          y2={HEIGHT - PADDING.bottom}
        />
        <line
          className={styles.axis}
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={HEIGHT - PADDING.bottom}
          y2={HEIGHT - PADDING.bottom}
        />
        {[0, 0.5, 1].map((position) => {
          const y = PADDING.top + chartHeight * position;
          const value = maximum - range * position;

          return (
            <g key={position}>
              <line
                className={styles.gridLine}
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
              />
              <text className={styles.axisLabel} x={PADDING.left - 10} y={y + 4}>
                {formatPrice(value)}
              </text>
            </g>
          );
        })}
        <text
          className={styles.axisLabel}
          x={PADDING.left}
          y={HEIGHT - 12}
        >
          {formatDate(orderedRecords[0].recorded_at)}
        </text>
        <text
          className={styles.axisLabel}
          textAnchor="end"
          x={WIDTH - PADDING.right}
          y={HEIGHT - 12}
        >
          {formatDate(orderedRecords[orderedRecords.length - 1].recorded_at)}
        </text>
        <polyline className={styles.line} fill="none" points={points} />
        {orderedRecords.map((record, index) => (
          <circle
            className={styles.point}
            cx={getX(index)}
            cy={getY(record.price)}
            key={`${record.id ?? record.recorded_at}-${record.price}`}
            r="4"
          >
            <title>
              {formatDate(record.recorded_at)}: {formatPrice(record.price)}
            </title>
          </circle>
        ))}
        <text className={styles.middleLabel} x={WIDTH - PADDING.right} y={PADDING.top + chartHeight / 2 + 4}>
          {formatPrice(middleValue)}
        </text>
      </svg>
    </div>
  );
}
