import { useState } from 'react';
import { departmentOperations } from '../data/departments';

export default function OperationsPanel({ departments = [], onOperationClick }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const renderButton = (op, key) => {
    const hasColor = !!op.color;
    const isHovered = hoveredBtn === key;
    const isGradient = op.colorMode === 'gradient';

    const baseStyle = {
      ...styles.button,
      ...(hasColor
        ? {
            borderLeft: isGradient
              ? '6px solid #ADD9BD'
              : `6px solid ${op.color}`,
            borderRight: isGradient
              ? '6px solid #D98E04'
              : `6px solid ${op.color}`,
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
          }
        : {}),
      ...(isHovered
        ? {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
            background: 'var(--bg-soft)',
          }
        : {}),
    };

    return (
      <button
        key={key}
        style={baseStyle}
        onMouseEnter={() => setHoveredBtn(key)}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={() => onOperationClick(op, key)}
      >
        {op.description} ({op.points.toFixed(3)})
      </button>
    );
  };

  return (
    <div style={styles.wrapper}>
      {departments.map((depKey) => {
        const dept = departmentOperations[depKey];
        if (!dept) return null;

        return (
          <div key={depKey} style={styles.block}>
            <div style={styles.column}>
              <h2 style={styles.heading}>{dept.name}</h2>
              <div style={styles.grid}>
                {dept.operations.map((op, i) =>
                  renderButton(op, `${depKey}-${i}`)
                )}
              </div>
            </div>

            {dept.hasPTS && (
              <div style={styles.column}>
                <h2 style={styles.heading}>PTS</h2>
                <div style={styles.grid}>
                  {dept.ptsOperations.map((op, i) =>
                    renderButton(op, `pts-${i}`)
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  block: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  column: {
    flex: '1 1 100%',
    minWidth: 0,
  },
  heading: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--border-soft)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
    gap: '12px',
  },
  button: {
    padding: '16px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text)',
    textAlign: 'center',
    lineHeight: 1.3,
    minHeight: '56px',
    transition: 'all 0.15s',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
};