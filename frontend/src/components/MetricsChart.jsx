import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  COLORS,
  classifyCase,
  isExtra,
  dateKey,
  dayLabel,
  casePoints,
  PERIOD_GOAL,
} from '../utils/metricsHelpers';

const DAY_GOAL = 8;

export default function MetricsChart({ daysData, view, downtimeMap }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // daysData: [{ date: Date, cases: [...], downtime: number }]
  const chartData = useMemo(() => {
    return daysData.map(({ date, cases, downtime }) => {
      const key = dateKey(date);

      // Separar extras de producción normal
      let productionPts = 0;
      let extraPts = 0;
      const byType = {
        unbonded: 0,
        therapeutic: 0,
        diagnostics: 0,
        retainer: 0,
        cts: 0,
        other: 0,
      };

      cases.forEach((c) => {
        const pts = casePoints(c);
        if (pts === 0) return;
        const ts = c.timestamp?.toDate?.();
        if (ts && isExtra(ts)) {
          extraPts += pts;
        } else {
          productionPts += pts;
          const cat = classifyCase(c);
          byType[cat] = (byType[cat] || 0) + pts;
        }
      });

      const dt = downtimeMap[key] ?? downtime;
      const total = productionPts + extraPts + dt;
      const reachedGoal = total >= DAY_GOAL;

      return {
        key,
        label: dayLabel(date),
        dateObj: date,
        productionPts,
        extraPts,
        downtime: dt,
        total,
        reachedGoal,
        byType,
        hasData: cases.length > 0 || dt > 0,
      };
    });
  }, [daysData, downtimeMap]);

  // Dividir en 2 filas de 6
  const row1 = chartData.slice(0, 6);
  const row2 = chartData.slice(6, 12);

  const renderBar = (data) => {
    // Combinado: 3 segmentos (producción, downtime, extras)
    if (view === 'combined') {
      const color = data.reachedGoal ? COLORS.production : COLORS.productionBad;
      return (
        <>
          <Bar dataKey="productionPts" stackId="a" fill={color} name="Producción" />
          <Bar dataKey="downtime" stackId="a" fill={COLORS.downtime} name="Tiempo Muerto" />
          <Bar dataKey="extraPts" stackId="a" fill={COLORS.extra} name="Extras" />
        </>
      );
    }

    // Por tipo: un segmento por categoría + downtime + extras
    return (
      <>
        <Bar dataKey="byType.unbonded" stackId="a" fill={COLORS.unbonded} name="Unbonded" />
        <Bar dataKey="byType.therapeutic" stackId="a" fill={COLORS.therapeutic} name="Therapeutic" />
        <Bar dataKey="byType.diagnostics" stackId="a" fill={COLORS.diagnostics} name="Diagnostics" />
        <Bar dataKey="byType.retainer" stackId="a" fill={COLORS.retainer} name="Retainer" />
        <Bar dataKey="byType.cts" stackId="a" fill={COLORS.cts} name="CT's" />
        <Bar dataKey="byType.other" stackId="a" fill="#94A3B8" name="Otros" />
        <Bar dataKey="downtime" stackId="a" fill={COLORS.downtime} name="Tiempo Muerto" />
        <Bar dataKey="extraPts" stackId="a" fill={COLORS.extra} name="Extras" />
      </>
    );
  };

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    // Construir leyenda
    const items = [];
    if (view === 'combined') {
      if (data.productionPts > 0)
        items.push({ color: data.reachedGoal ? COLORS.production : COLORS.productionBad, label: 'Producción', value: data.productionPts });
      if (data.downtime > 0)
        items.push({ color: COLORS.downtime, label: 'Tiempo Muerto', value: data.downtime });
      if (data.extraPts > 0)
        items.push({ color: COLORS.extra, label: 'Extras', value: data.extraPts });
    } else {
      const labels = {
        unbonded: 'Unbonded',
        therapeutic: 'Therapeutic',
        diagnostics: 'Diagnostics',
        retainer: 'Retainer',
        cts: "CT's",
        other: 'Otros',
      };
      Object.entries(data.byType).forEach(([k, v]) => {
        if (v > 0) items.push({ color: COLORS[k] || '#94A3B8', label: labels[k], value: v });
      });
      if (data.downtime > 0)
        items.push({ color: COLORS.downtime, label: 'Tiempo Muerto', value: data.downtime });
      if (data.extraPts > 0)
        items.push({ color: COLORS.extra, label: 'Extras', value: data.extraPts });
    }

    return (
      <div style={styles.tooltip}>
        <div style={styles.tooltipTitle}>{data.label}</div>
        {items.map((it, i) => (
          <div key={i} style={styles.tooltipRow}>
            <span style={{ ...styles.tooltipDot, background: it.color }} />
            <span style={styles.tooltipValue}>{it.value.toFixed(2)}</span>
            <span style={styles.tooltipLabel}>({it.label})</span>
          </div>
        ))}
        <div style={styles.tooltipTotal}>
          Total: {data.total.toFixed(2)} / {DAY_GOAL}
        </div>
      </div>
    );
  };

  const renderRow = (data, rowKey) => (
    <div style={styles.row} key={rowKey}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 40, right: 10, left: -20, bottom: 10 }}
          barCategoryGap="20%"
        >
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-soft)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          {renderBar(data[0])}
        </BarChart>
      </ResponsiveContainer>

      {/* Números encima de cada barra (overlay) */}
      <div style={styles.totalOverlay}>
        {data.map((d, i) => (
          <div
            key={d.key}
            style={{
              ...styles.totalNum,
              color: d.reachedGoal ? COLORS.production : COLORS.productionBad,
            }}
          >
            {d.total.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      {renderRow(row1, 'r1')}
      {renderRow(row2, 'r2')}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  row: {
    position: 'relative',
    width: '100%',
  },
  totalOverlay: {
    position: 'absolute',
    top: '4px',
    left: 0,
    right: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    pointerEvents: 'none',
    paddingLeft: '36px',
    paddingRight: '10px',
    zIndex: 2,
  },
  totalNum: {
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  tooltip: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    boxShadow: 'var(--shadow)',
    minWidth: '180px',
  },
  tooltipTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    marginBottom: '6px',
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    marginBottom: '2px',
  },
  tooltipDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  tooltipValue: {
    fontWeight: 700,
    color: 'var(--text-h)',
    fontVariantNumeric: 'tabular-nums',
  },
  tooltipLabel: {
    color: 'var(--text-soft)',
  },
  tooltipTotal: {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-soft)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    textAlign: 'right',
  },
};