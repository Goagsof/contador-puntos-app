import { useState, useEffect } from 'react';

export default function CodeModal({ isOpen, operation, onConfirm, onOmit, onCancel }) {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen || !operation) return null;

  const handleConfirm = async () => {
    if (saving) return;
    const trimmed = code.trim();
    if (trimmed.length === 0 || trimmed.length > 10) {
      alert('Ingresa un código válido (1 a 10 caracteres)');
      return;
    }
    setSaving(true);
    try {
      await onConfirm(trimmed);
    } finally {
      setSaving(false);
    }
  };

  const handleOmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onOmit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Ingresar código para {operation.description}</h3>
        <input
          type="text"
          placeholder="Código (máx. 10 caracteres)"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          style={styles.input}
          autoFocus
          disabled={saving}
        />
        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={{ ...styles.btn, ...styles.cancel }}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleOmit}
            style={{ ...styles.btn, ...styles.omit }}
            disabled={saving}
          >
            Omitir Código
          </button>
          <button
            onClick={handleConfirm}
            style={{ ...styles.btn, ...styles.confirm }}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Confirmar'}
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
    margin: '0 0 18px 0',
    color: 'var(--text-h)',
    fontSize: '1.1rem',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    outline: 'none',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
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
  omit: {
    background: 'var(--bg-muted)',
    color: 'var(--text-h)',
  },
  cancel: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    borderColor: 'var(--danger-border)',
  },
};