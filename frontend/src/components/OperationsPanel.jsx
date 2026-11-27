// From Uiverse.io by Randdose - https://uiverse.io/Randdose/brown-grasshopper-46
// MIT License, Copyright (c) Randdose (Randomness)
// Adaptado a React + sistema de temas del proyecto.

import { useState } from 'react';
import { departmentOperations } from '../data/departments';

const CTS_LEFT = '#ADD9BD';  // menta
const CTS_RIGHT = '#D98E04'; // naranja

export default function OperationsPanel({ departments = [], onOperationClick }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const renderButton = (op, key) => {
    const hasColor = !!op.color;
    const isHovered = hoveredBtn === key;
    const isGradient = op.colorMode === 'gradient';

    // Colores de borde y texto
    const borderColor = hasColor
      ? isGradient
        ? `linear-gradient(90deg, ${CTS_LEFT}, ${CTS_RIGHT})` // no se usa como border, se usa abajo
        : op.color
      : 'var(--primary)';

    // Para CT's usamos borde con degradado (se aplica con border-image)
    // Para el resto, borde sólido.
    const baseStyle = {
      ...styles.button,
      ...(isGradient
        ? {
            borderImage: `linear-gradient(90deg, ${CTS_LEFT}, ${CTS_RIGHT}) 1`,
            color: 'var(--text-h)',
          }
        : {
            borderColor: borderColor,
            color: hasColor ? op.color : 'var(--primary)',
          }),
      ...(isHovered ? styles.buttonHover : {}),
    };

    // Colores de los círculos
    const leftCircleColor = isGradient ? CTS_LEFT : (hasColor ? op.color : 'var(--primary)');
    const rightCircleColor = isGradient ? CTS_RIGHT : (hasColor ? op.color : 'var(--primary)');

    return (
      <button
        key={key}
        style={baseStyle}
        className={`op-case-btn ${isGradient ? 'is-gradient' : ''}`}
        onMouseEnter={() => setHoveredBtn(key)}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={() => onOperationClick(op, key)}
      >
        <span
          className="op-case-circle op-case-circle-left"
          style={{ background: leftCircleColor }}
        />
        <span
          className="op-case-circle op-case-circle-right"
          style={{ background: rightCircleColor }}
        />
        <span className="op-case-label">
          {op.description} ({op.points.toFixed(3)})
        </span>
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
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '0.7em 1.2em',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.3s, color 0.3s',
    userSelect: 'none',
    textAlign: 'center',
    minHeight: '56px',
    boxSizing: 'border-box',
    lineHeight: 1.3,
    width: '100%',
    background: 'var(--bg-card)',
  },
  buttonHover: {
    color: '#212121',
  },
};