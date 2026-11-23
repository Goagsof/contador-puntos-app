import Clock from './Clock';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { departmentOperations } from '../data/departments';

export default function Header({ department, onMenuClick }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const deptName = departmentOperations[department]?.name || 'Modeling';

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button onClick={onMenuClick} style={styles.menuBtn} title="Menú">
          ☰
        </button>
      </div>

      <div style={styles.center}>
        <h1 style={styles.title}>
          Contador de Puntos
          <span style={styles.divider}>|</span>
          <span style={styles.deptName}>{deptName}</span>
        </h1>
      </div>

      <div style={styles.right}>
        <button
          onClick={toggleTheme}
          style={styles.themeBtn}
          title={theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <Clock />
        <img
          src="/Dentsply_Sirona_Logo.webp"
          alt="Dentsply Sirona"
          style={styles.logo}
        />
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px',
    boxShadow: '0 2px 8px rgba(0,20,40,0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    boxSizing: 'border-box',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  menuBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.3rem',
    color: 'var(--primary)',
  },
  center: { flex: 1, display: 'flex', justifyContent: 'center' },
  title: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  divider: { fontWeight: 400, color: 'var(--text-soft)' },
  deptName: { fontWeight: 400, color: 'var(--text-soft)' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  themeBtn: {
    background: 'var(--bg-soft)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.1rem',
  },
  logo: { height: '44px', width: 'auto', maxWidth: '160px' },
};