import { useState, useEffect } from 'react';

export default function NotesModal({ isOpen, caseItem, onSave, onCancel }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen && caseItem) {
      setText(caseItem.notes || '');
    }
  }, [isOpen, caseItem]);

  if (!isOpen || !caseItem) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Notas del Caso</h3>
        <p style={styles.subtitle}>
          Caso: <strong>{caseItem.code}</strong> · {caseItem.description}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tus notas aquí..."
          rows={5}
          style={styles.textarea}
          autoFocus
        />
        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={{ ...styles.btn, ...styles.cancel }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(text.trim())}
            style={{ ...styles.btn, ...styles.confirm }}
          >
            Guardar Nota
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
    maxWidth: '480px',
    boxShadow: 'var(--shadow)',
  },
  title: {
    margin: '0 0 6px 0',
    color: 'var(--text-h)',
    fontSize: '1.15rem',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 16px 0',
    color: 'var(--text-soft)',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    outline: 'none',
    marginBottom: '16px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    minHeight: '100px',
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