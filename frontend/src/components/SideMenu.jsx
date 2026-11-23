import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SideMenu({ isOpen, onClose, onNavigateMetrics }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoSettings = () => {
    onClose();
    navigate('/ajustes');
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          ...styles.overlay,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />
      <aside
        style={{
          ...styles.panel,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {profile?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={styles.profileName}>{profile?.name || 'Usuario'}</div>
            <div style={styles.profileRole}>{roleLabel(profile?.role)}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <button onClick={onNavigateMetrics} style={styles.item}>
            📊 Métricas
          </button>
          <button onClick={handleGoSettings} style={styles.item}>
            ⚙️ Ajustes
          </button>
        </nav>

        <div style={styles.footer}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

function roleLabel(role) {
  const map = {
    di: 'DI',
    qc: 'QC',
    modeling: 'Modeling / PTS',
    lider: 'Líder',
    admin: 'Administrador',
  };
  return map[role] || 'Sin rol';
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,20,40,0.3)',
    zIndex: 200,
    transition: 'opacity 0.25s ease',
  },
  panel: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '280px',
    height: '100vh',
    background: 'var(--bg-card)',
    boxShadow: '4px 0 20px rgba(0,20,40,0.1)',
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    transition: 'transform 0.3s ease',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'var(--bg-soft)',
    borderRadius: '12px',
    border: '1px solid var(--border-soft)',
    marginBottom: '20px',
    flexShrink: 0,
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  profileName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  item: {
    padding: '12px 16px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '10px',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  footer: {
    borderTop: '1px solid var(--border-soft)',
    paddingTop: '16px',
    flexShrink: 0,
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger-text)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};