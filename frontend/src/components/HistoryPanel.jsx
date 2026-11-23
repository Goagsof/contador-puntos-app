import { useState } from 'react';
import { useCases } from '../context/CasesContext';
import ReworkModal from './ReworkModal';
import NotesModal from './NotesModal';

export default function HistoryPanel() {
  const { cases, loading, removeCase, markAsRework, updateNotes } = useCases();
  const [reworkTarget, setReworkTarget] = useState(null);
  const [notesTarget, setNotesTarget] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  if (loading) {
    return <p style={styles.empty}>Cargando casos...</p>;
  }

  if (cases.length === 0) {
    return <p style={styles.empty}>No hay casos registrados todavía.</p>;
  }

  const handleConfirmRework = async (reworkType) => {
    if (reworkTarget) {
      await markAsRework(reworkTarget.id, reworkType);
    }
    setReworkTarget(null);
  };

  const handleSaveNotes = async (text) => {
    if (notesTarget) {
      await updateNotes(notesTarget.id, text);
    }
    setNotesTarget(null);
  };

  return (
    <>
      <div style={styles.list}>
        {cases.map((c) => {
          const date = c.timestamp?.toDate
            ? c.timestamp.toDate().toLocaleString()
            : '—';

          const isModeling = ['Modeling', 'DI', 'QC'].includes(c.type);
          const canRework = isModeling && !c.isRework;
          const hasNotes = c.notes && c.notes.length > 0;

          return (
            <div
              key={c.id}
              style={{
                ...styles.item,
                ...(c.isRework ? styles.itemRework : {}),
              }}
            >
              <div style={styles.itemContent}>
                <div style={styles.row}>
                  <span style={styles.code}>Código: {c.code}</span>
                  <span style={styles.points}>
                    {c.points > 0 ? `${c.points.toFixed(3)} pts` : 'Rework'}
                  </span>
                </div>
                <div style={styles.description}>
                  {c.type}: {c.description}
                </div>
                <div style={styles.timestamp}>
                  {c.department?.toUpperCase()} · {date}
                </div>
                {c.isRework && (
                  <div style={styles.reworkBadge}>
                    REWORK {c.reworkType === 'repetido' ? '(Repetido)' : '(Nuevo)'}
                  </div>
                )}
                {hasNotes && (
                  <div style={styles.notePreview}>
                    📝 {c.notes.substring(0, 60)}
                    {c.notes.length > 60 ? '...' : ''}
                  </div>
                )}
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => setNotesTarget(c)}
                  style={{
                    ...styles.notesBtn,
                    ...(hoveredBtn === `n-${c.id}` ? styles.btnHover : {}),
                  }}
                  onMouseEnter={() => setHoveredBtn(`n-${c.id}`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  title="Editar notas"
                >
                  📝
                </button>
                {canRework && (
                  <button
                    onClick={() => setReworkTarget(c)}
                    style={{
                      ...styles.reworkBtn,
                      ...(hoveredBtn === `r-${c.id}` ? styles.btnHover : {}),
                    }}
                    onMouseEnter={() => setHoveredBtn(`r-${c.id}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    title="Marcar como Rework"
                  >
                    RW
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el caso ${c.code}?`)) {
                      removeCase(c.id);
                    }
                  }}
                  style={{
                    ...styles.deleteBtn,
                    ...(hoveredBtn === `d-${c.id}` ? styles.btnHover : {}),
                  }}
                  onMouseEnter={() => setHoveredBtn(`d-${c.id}`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  title="Eliminar caso"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ReworkModal
        isOpen={!!reworkTarget}
        caseItem={reworkTarget}
        onConfirm={handleConfirmRework}
        onCancel={() => setReworkTarget(null)}
      />

      <NotesModal
        isOpen={!!notesTarget}
        caseItem={notesTarget}
        onSave={handleSaveNotes}
        onCancel={() => setNotesTarget(null)}
      />
    </>
  );
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  item: {
    background: 'var(--bg-soft)',
    border: '1px solid var(--border-soft)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  itemRework: {
    background: 'var(--danger-bg)',
    borderLeft: '4px solid var(--danger-border)',
  },
  itemContent: { flex: 1 },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  code: {
    fontWeight: 600,
    color: 'var(--text-h)',
    fontSize: '0.9rem',
  },
  points: {
    fontWeight: 600,
    color: 'var(--success)',
    fontSize: '0.9rem',
  },
  description: {
    fontSize: '0.82rem',
    color: 'var(--text-soft)',
    marginBottom: '3px',
  },
  timestamp: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  reworkBadge: {
    marginTop: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--danger-text)',
  },
  notePreview: {
    marginTop: '6px',
    padding: '6px 10px',
    background: 'var(--bg-muted)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-h)',
    borderLeft: '3px solid var(--primary)',
  },
  actions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '120px',
  },
  notesBtn: {
    background: 'var(--bg-muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    width: '36px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--text)',
    transition: 'all 0.15s',
  },
  reworkBtn: {
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-text)',
    borderRadius: '8px',
    width: '36px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 700,
    transition: 'all 0.15s',
  },
  deleteBtn: {
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-text)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.15s',
  },
  btnHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '24px',
    fontStyle: 'italic',
  },
};