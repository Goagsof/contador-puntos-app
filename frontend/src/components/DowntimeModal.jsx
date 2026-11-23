import { useState, useEffect } from 'react';

const PURPLE = '#8B5CF6';

export default function DowntimeModal({ isOpen, currentHours, onSave, onCancel }) {
  const [value, setValue] = useState(currentHours || 0);

  useEffect(() => {
    if (isOpen) setValue(currentHours || 0);
  }, [isOpen, currentHours]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(Number(value));
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Tiempo Muerto</h3>
        <p style={styles.subtitle}>
          Suma 0.5 puntos por cada hora sin producción (máx. 8 hrs)
        </p>

        <div style={styles.bigValue}>
          <span style={{ color: PURPLE }}>{Number(value).toFixed(1)}</span>
          <span style={styles.bigValueSuffix}>/ 8.0</span>
        </div>

        <div style={styles.sliderRow}>
          <span style={styles.sideLabel}>0</span>
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={styles.slider}
          />
          <span style={styles.sideLabel}>8</span>
        </div>

        <div style={styles.actions}>
          <button onClick={onCancel} style={{ ...styles.btn, ...styles.cancel }}>
            Cancelar
          </button>
          <button onClick={handleSave} style={{ ...styles.btn, ...styles.save }}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,20,40,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '28px',
    width: '92%',
    maxWidth: '440px',
    boxShadow: 'var(--shadow)',
  },
  title: {
    margin: '0 0 6px 0',
    color: 'var(--text-h)',
    fontSize: '1.15rem',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 18px 0',
    color: 'var(--text-soft)',
    fontSize: '0.82rem',
    textAlign: 'center',
  },
  bigValue: {
    fontSize: '3rem',
    fontWeight: 700,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: '10px',
    lineHeight: 1,
  },
  bigValueSuffix: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginLeft: '6px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '22px',
    padding: '0 4px',
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
    accentColor: PURPLE,
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  btn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  cancel: {
    background: 'var(--bg-muted)',
    color: 'var(--text)',
  },
  save: {
    background: PURPLE,
    color: '#fff',
    borderColor: PURPLE,
  },
};