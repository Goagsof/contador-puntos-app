import Clock from './Clock';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { departmentOperations } from '../data/departments';
import HamburgerButton from './HamburgerButton';
import ThemeToggle from './ThemeToggle';

export default function Header({ title, onMenuClick, isMenuOpen = false, showDepartment = false }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const deptName =
    showDepartment && profile?.role
      ? departmentOperations[profile.role]?.name || null
      : null;

  const goHome = () => {
    const role = profile?.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'lider') navigate('/lider');
    else navigate('/empleado');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <HamburgerButton isOpen={isMenuOpen} onClick={onMenuClick} title="Menú" />
      </div>

      <div style={styles.center}>
        <h1 style={styles.title}>
          {title}
          {deptName && (
            <>
              <span style={styles.divider}>|</span>
              <span style={styles.deptName}>{deptName}</span>
            </>
          )}
        </h1>
      </div>

      <div style={styles.right}>
        <Clock />
        <ThemeToggle />
        <button onClick={goHome} style={styles.logoBtn} title="Ir al inicio">
          <img src="/Dentsply_Sirona_Logo.webp" alt="Dentsply Sirona" style={styles.logo} />
        </button>
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
    zIndex: 200,
    width: '100%',
    boxSizing: 'border-box',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
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
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBtn: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.15s',
  },
  logo: {
    height: '44px',
    width: 'auto',
    maxWidth: '160px',
  },
};