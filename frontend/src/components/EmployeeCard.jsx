const GOAL = 8;
const QUALITY_THRESHOLD = 83;

const COLOR_GOOD = '#1e7e34';
const COLOR_BAD = '#c0392b';
const COLOR_DT = '#8B5CF6';

export default function EmployeeCard({ employee, onClick }) {
  const reached = employee.reachedGoal;
  const qualityGood = employee.quality >= QUALITY_THRESHOLD;

  return (
    <button onClick={onClick} style={styles.card}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          {(employee.name || '?').charAt(0).toUpperCase()}
        </div>
        <div style={styles.nameBox}>
          <div style={styles.name}>{employee.name || 'Sin nombre'}</div>
          <div style={styles.email}>{employee.email || '—'}</div>
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={{ ...styles.statValue, color: reached ? COLOR_GOOD : COLOR_BAD }}>
            {employee.total.toFixed(2)}
          </div>
          <div style={styles.statLabel}>Puntos</div>
        </div>
        <div style={styles.stat}>
          <div
            style={{
              ...styles.statValue,
              color: qualityGood ? COLOR_GOOD : COLOR_BAD,
            }}
          >
            {employee.quality.toFixed(1)}%
          </div>
          <div style={styles.statLabel}>Calidad</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statValue, color: COLOR_DT }}>
            {employee.downtime.toFixed(1)}
          </div>
          <div style={styles.statLabel}>T. Muerto</div>
        </div>
      </div>

      <div style={styles.footer}>
        <span
          style={{
            ...styles.badge,
            background: !employee.hasData
              ? 'var(--bg-muted)'
              : reached
              ? 'var(--success-bg)'
              : 'var(--danger-bg)',
            color: !employee.hasData
              ? 'var(--text-soft)'
              : reached
              ? 'var(--success)'
              : 'var(--danger-text)',
            borderColor: !employee.hasData
              ? 'var(--border)'
              : reached
              ? 'var(--success-border)'
              : 'var(--danger-border)',
          }}
        >
          {!employee.hasData
            ? 'Sin actividad'
            : reached
            ? 'Meta cumplida'
            : 'Bajo meta'}
        </span>
        <span style={styles.casesCount}>{employee.casesCount} casos</span>
      </div>
    </button>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
    fontFamily: 'inherit',
    color: 'inherit',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  nameBox: { minWidth: 0, flex: 1 },
  name: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  email: {
    fontSize: '0.72rem',
    color: 'var(--text-soft)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  stat: {
    textAlign: 'center',
    padding: '8px 4px',
    background: 'var(--bg-soft)',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '1.05rem',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '2px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '4px',
  },
  badge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  casesCount: {
    fontSize: '0.72rem',
    color: 'var(--text-soft)',
  },
};