import { useState, useEffect } from 'react';

export default function ReworkModal({
  isOpen,
  caseItem,
  onConfirm,
  onCancel,
}) {
  const [reworkType, setReworkType] = useState('nuevo');

  useEffect(() => {
    if (isOpen) setReworkType('nuevo');
  }, [isOpen]);

  if (!isOpen || !caseItem) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Marcar Rework</h3>
        <p style={styles.subtitle}>
          Caso: <strong>{caseItem.code}</strong> · {caseItem.description}
        </p>

        <div style={styles.options}>
          <label
            style={{
              ...styles.option,
              ...(reworkType === 'nuevo' ? styles.optionActive : {}),
            }}
          >
            <input
              type="radio"
              name="rework-type"
              value="nuevo"
              checked={reworkType === 'nuevo'}
              onChange={() => setReworkType('nuevo')}
              style={styles.radio}
            />
            <div>
              <strong style={styles.optionTitle}>Rework Nuevo</strong>
              <div style={styles.optionDesc}>Resta 1 caso aprobado de calidad</div>
            </div>
          </label>

          <label
            style={{
              ...styles.option,
              ...(reworkType === 'repetido' ? styles.optionActive : {}),
            }}
          >
            <input
              type="radio"
              name="rework-type"
              value="repetido"
              checked={reworkType === 'repetido'}
              onChange={() => setReworkType('repetido')}
              style={styles.radio}
            />
            <div>
              <strong style={styles.optionTitle}>Rework Repetido</strong>
              <div style={styles.optionDesc}>Resta 0.10% de calidad</div>
            </div>
          </label>
        </div>

        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={{ ...styles.btn, ...styles.cancel }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reworkType)}
            style={{ ...styles.btn, ...styles.confirm }}
          >
            Confirmar
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
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    background: 'var(--bg-soft)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  optionActive: {
    borderColor: 'var(--primary)',
    background: 'var(--primary-soft)',
  },
  radio: {
    marginTop: '2px',
    accentColor: 'var(--primary)',
  },
  optionTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-h)',
  },
  optionDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-soft)',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  btn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  confirm: {
    background: 'var(--primary)',
    color: '#fff',
    borderColor: 'var(--primary)',
  },
  cancel: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    borderColor: 'var(--danger-border)',
  },
};