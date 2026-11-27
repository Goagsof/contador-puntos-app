import { COLORS, PERIOD_GOAL } from '../utils/metricsHelpers';

export default function MetricsSummary({ totalPts, totalCases, avgQuality, totalDowntime, totalExtras }) {
  const reached = totalPts >= PERIOD_GOAL;
  const pct = Math.min((totalPts / PERIOD_GOAL) * 100, 100);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.label}>Meta del período</div>
        <div style={styles.bigValue}>
          <span style={{ color: reached ? COLORS.production : COLORS.productionBad }}>
            {totalPts.toFixed(2)}
          </span>
          <span style={styles.suffix}>/ {PERIOD_GOAL}</span>
        </div>
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${pct}%`,
              background: reached ? COLORS.production : COLORS.productionBad,
            }}
          />
        </div>
      </div>

      <div style={styles.smallGrid}>
        <div style={styles.smallCard}>
          <div style={styles.smallLabel}>Casos</div>
          <div style={styles.smallValue}>{totalCases}</div>
        </div>
        <div style={styles.smallCard}>
          <div style={styles.smallLabel}>Calidad</div>
          <div
            style={{
              ...styles.smallValue,
              color: avgQuality >= 83 ? COLORS.production : COLORS.productionBad,
            }}
          >
            {avgQuality.toFixed(1)}%
          </div>
        </div>
        <div style={styles.smallCard}>
          <div style={styles.smallLabel}>T. Muerto</div>
          <div style={{ ...styles.smallValue, color: COLORS.downtime }}>
            {totalDowntime.toFixed(2)}
          </div>
        </div>
        <div style={styles.smallCard}>
          <div style={styles.smallLabel}>Extras</div>
          <div style={{ ...styles.smallValue, color: COLORS.extra }}>
            {totalExtras.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '16px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '18px',
    boxShadow: 'var(--shadow)',
  },
  label: {
    fontSize: '0.78rem',
    color: 'var(--text-soft)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  bigValue: {
    fontSize: '2.2rem',
    fontWeight: 700,
    margin: '6px 0 10px 0',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  suffix: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    marginLeft: '6px',
  },
  barTrack: {
    width: '100%',
    height: '10px',
    background: 'var(--bg-muted)',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: '5px',
  },
  smallGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  smallCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-soft)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '4px',
  },
  smallValue: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    fontVariantNumeric: 'tabular-nums',
  },
};