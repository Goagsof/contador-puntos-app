import { useCases } from '../context/CasesContext';

export default function DowntimePanel() {
  const { downtime, updateDowntime } = useCases();

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h3 style={styles.title}>Tiempo Muerto</h3>
        <div style={styles.badge}>
          <span>{downtime}</span> / 8 pts
        </div>
      </div>
      <p style={styles.desc}>
        Suma 1 punto por cada hora sin producción (máx. 8 hrs)
      </p>

      <div style={styles.sliderRow}>
        <span style={styles.sideLabel}>0</span>
        <input
          type="range"
          min="0"
          max="8"
          step="1"
          value={downtime}
          onChange={(e) => updateDowntime(e.target.value)}
          style={styles.slider}
        />
        <span style={styles.sideLabel}>8</span>
      </div>

      <div style={styles.actions}>
        <button
          onClick={() => updateDowntime(0)}
          style={styles.resetBtn}
          disabled={downtime === 0}
        >
          Reiniciar Tiempo Muerto
        </button>
      </div>
    </div>
  );
}

const styles = {
  section: {
    background: 'var(--bg-soft)',
    borderRadius: '12px',
    padding: '18px 16px',
    border: '1px solid var(--border-soft)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-h)',
  },
  badge: {
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: '30px',
    padding: '4px 14px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  desc: {
    fontSize: '0.75rem',
    color: 'var(--text-soft)',
    margin: '0 0 12px 0',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  sideLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-soft)',
    minWidth: '16px',
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    accentColor: 'var(--primary)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  resetBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 18px',
    color: 'var(--text)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
};