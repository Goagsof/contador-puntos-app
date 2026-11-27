import { COLORS, classifyCase, casePoints } from '../utils/metricsHelpers';

const LABELS = {
  unbonded: 'Unbonded',
  therapeutic: 'Therapeutic',
  diagnostics: 'Diagnostics',
  retainer: 'Retainer',
  cts: "CT's",
  other: 'Otros',
};

export default function MetricsByType({ cases }) {
  const totals = {
    unbonded: 0,
    therapeutic: 0,
    diagnostics: 0,
    retainer: 0,
    cts: 0,
    other: 0,
  };
  let total = 0;
  cases.forEach((c) => {
    const pts = casePoints(c);
    if (pts === 0) return;
    const cat = classifyCase(c);
    totals[cat] = (totals[cat] || 0) + pts;
    total += pts;
  });

  const entries = Object.entries(totals).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    return <p style={styles.empty}>No hay casos en este período.</p>;
  }

  return (
    <div style={styles.list}>
      {entries.map(([key, value]) => {
        const pct = (value / total) * 100;
        return (
          <div key={key} style={styles.row}>
            <span style={{ ...styles.dot, background: COLORS[key] }} />
            <span style={styles.label}>{LABELS[key]}</span>
            <span style={styles.value}>{value.toFixed(2)} pts</span>
            <span style={styles.pct}>{pct.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: {
    display: 'grid',
    gridTemplateColumns: '14px 1fr auto auto',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    background: 'var(--bg-soft)',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  dot: { width: '14px', height: '14px', borderRadius: '3px' },
  label: { color: 'var(--text-h)', fontWeight: 600 },
  value: { color: 'var(--text)', fontVariantNumeric: 'tabular-nums' },
  pct: { color: 'var(--text-soft)', fontSize: '0.78rem', minWidth: '48px', textAlign: 'right' },
  empty: { textAlign: 'center', color: 'var(--text-muted)', padding: '20px' },
};