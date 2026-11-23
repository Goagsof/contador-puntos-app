import { useState } from 'react';
import { useCases } from '../context/CasesContext';
import DowntimeModal from './DowntimeModal';


export default function ControlPanel() {
  const { cases, downtime, undoLastCase, resetAll, updateDowntime } = useCases();
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [showDowntime, setShowDowntime] = useState(false);

  const handleUndo = async () => {
    if (cases.length === 0) return;
    if (confirm(`¿Deshacer el último caso (${cases[0].code})?`)) {
      await undoLastCase();
    }
  };

  const handleReset = async () => {
    if (cases.length === 0) {
      alert('No hay casos que reiniciar.');
      return;
    }
    if (
      confirm(
        '¿Reiniciar TODO? Se borrarán todos tus casos y el tiempo muerto. Esta acción no se puede deshacer.'
      )
    ) {
      await resetAll();
    }
  };

  const handleSaveDowntime = async (hours) => {
    await updateDowntime(hours);
    setShowDowntime(false);
  };

  const downtimeLabel =
    downtime > 0 ? `Tiempo Muerto (${Number(downtime).toFixed(1)})` : 'Tiempo Muerto';

  return (
    <>
      <div style={styles.grid}>
        <button
          onClick={handleUndo}
          disabled={cases.length === 0}
          style={{
            ...styles.btn,
            ...styles.undo,
            ...(hoveredBtn === 'undo' && cases.length > 0 ? styles.btnHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('undo')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          Deshacer
        </button>
        <button
          onClick={() => window.print()}
          style={{
            ...styles.btn,
            ...styles.print,
            ...(hoveredBtn === 'print' ? styles.btnHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('print')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          PDF
        </button>
        <button
          onClick={handleReset}
          disabled={cases.length === 0}
          style={{
            ...styles.btn,
            ...styles.reset,
            ...(hoveredBtn === 'reset' && cases.length > 0 ? styles.btnHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('reset')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          Reiniciar
        </button>
        <button
          onClick={() => setShowDowntime(true)}
          style={{
            ...styles.btn,
            ...styles.downtime,
            ...(hoveredBtn === 'downtime' ? styles.btnHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('downtime')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          {downtimeLabel}
        </button>
      </div>

      <DowntimeModal
        isOpen={showDowntime}
        currentHours={downtime}
        onSave={handleSaveDowntime}
        onCancel={() => setShowDowntime(false)}
      />
    </>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  btn: {
    padding: '12px 8px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    transition: 'all 0.15s',
    lineHeight: 1.2,
  },
  undo: {
    background: 'var(--bg-soft)',
    color: 'var(--text)',
  },
  print: {
    background: 'var(--success-bg)',
    color: 'var(--success)',
    borderColor: 'var(--success-border)',
  },
  reset: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    borderColor: 'var(--danger-border)',
  },
  downtime: {
    background: 'var(--downtime-bg)',
    color: 'var(--downtime-text)',
    borderColor: 'var(--downtime-border)',
  },
  btnHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    filter: 'brightness(1.05)',
  },
};