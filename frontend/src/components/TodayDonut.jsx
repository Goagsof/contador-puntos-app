import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function TodayDonut({
  value = 0,
  max = 100,
  label = '',
  color = 'var(--primary)',
  centerText = '',
  centerSubtext = '',
  formatter = (v) => v,
}) {
  const safeValue = Math.max(value, 0);
  const safeMax = Math.max(max, 0.0001);
  const fillPct = Math.min((safeValue / safeMax) * 100, 100);
  const restPct = Math.max(100 - fillPct, 0);

  const data = [
    { name: 'fill', value: Math.max(fillPct, 0.3) },
    { name: 'rest', value: Math.max(restPct, 0.3) },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.chartBox}>
        <div style={styles.shadow} />
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={52}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive
              animationDuration={700}
            >
              <Cell fill={color} />
              <Cell fill="var(--bg-muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={styles.centerLabel}>
          <div style={styles.centerValue}>{centerText}</div>
          {centerSubtext && <div style={styles.centerSubtext}>{centerSubtext}</div>}
        </div>
      </div>
      <div style={styles.footer}>
        <span style={{ ...styles.label, color }}>{label}</span>
        <span style={styles.formatted}>{formatter(safeValue)}</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
  },
  chartBox: {
    position: 'relative',
    width: '100%',
    maxWidth: '170px',
    aspectRatio: '1 / 1',
    filter: 'drop-shadow(0 6px 8px rgba(0, 0, 0, 0.18))',
    overflow: 'visible',
  },
  shadow: {
    position: 'absolute',
    left: '50%',
    bottom: '2px',
    transform: 'translateX(-50%)',
    width: '65%',
    height: '7px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.22), transparent 70%)',
    filter: 'blur(3px)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  centerLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  centerValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  centerSubtext: {
    fontSize: '0.62rem',
    color: 'var(--text-soft)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '3px',
  },
  footer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginTop: '4px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  formatted: {
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
};