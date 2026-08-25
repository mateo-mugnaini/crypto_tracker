import type { PriceHistoryRecord } from "../../api/types";
import styles from "./ComparisonChart.module.css";

export interface ComparisonSeries {
  color: string;
  label: string;
  records: PriceHistoryRecord[];
}

interface ComparisonChartProps {
  series: ComparisonSeries[];
}

const WIDTH = 760;
const HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 42, left: 64 };

function formatPercentage(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDate(value: number) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function normalizeRecords(records: PriceHistoryRecord[]) {
  const ordered = [...records].sort(
    (left, right) =>
      new Date(left.recorded_at).getTime() -
      new Date(right.recorded_at).getTime(),
  );
  const basePrice = ordered[0]?.price ?? 0;

  return ordered.map((record) => ({
    time: new Date(record.recorded_at).getTime(),
    value: basePrice === 0 ? 0 : ((record.price - basePrice) / basePrice) * 100,
  }));
}

export default function ComparisonChart({ series }: ComparisonChartProps) {
  const normalizedSeries = series.map((item) => ({
    ...item,
    points: normalizeRecords(item.records),
  }));
  const allPoints = normalizedSeries.flatMap((item) => item.points);

  if (allPoints.length === 0) {
    return <p className={styles.empty}>No hay suficientes datos para comparar.</p>;
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
  const getX = (time: number) =>
    PADDING.left + ((time - minimumTime) / timeRange) * chartWidth;
  const getY = (value: number) =>
    PADDING.top + chartHeight - ((value - minimumValue) / valueRange) * chartHeight;
  const zeroY = getY(0);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <div>
          <span className={styles.eyebrow}>Comparación normalizada</span>
          <h3>Variación desde el primer registro</h3>
        </div>
        <div className={styles.legend}>
          {normalizedSeries.map((item) => (
            <span key={item.label}>
              <i style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <svg
        aria-label="Comparación de variación porcentual entre monedas"
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
          y1={zeroY}
          y2={zeroY}
        />
        {[0, 0.5, 1].map((position) => {
          const value = maximumValue - valueRange * position;
          const y = getY(value);

          return (
            <g key={position}>
              <line
                className={styles.gridLine}
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
              />
              <text className={styles.axisLabel} x={PADDING.left - 8} y={y + 4}>
                {formatPercentage(value)}
              </text>
            </g>
          );
        })}
        <text className={styles.axisLabel} x={PADDING.left} y={HEIGHT - 12}>
          {formatDate(minimumTime)}
        </text>
        <text
          className={styles.axisLabel}
          textAnchor="end"
          x={WIDTH - PADDING.right}
          y={HEIGHT - 12}
        >
          {formatDate(maximumTime)}
        </text>
        {normalizedSeries.map((item) => (
          <polyline
            className={styles.line}
            fill="none"
            key={item.label}
            points={item.points
              .map((point) => `${getX(point.time)},${getY(point.value)}`)
              .join(" ")}
            style={{ stroke: item.color }}
          />
        ))}
      </svg>
    </div>
  );
}
