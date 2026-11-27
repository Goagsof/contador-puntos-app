// From Uiverse.io by DipeshPun91 - https://uiverse.io/DipeshPun91/curvy-termite-76
// MIT License, Copyright (c) DipeshPun91 (Dipesh Pun)
// Adaptado a React + Lucide + sistema de temas del proyecto.

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Users } from 'lucide-react';

export default function SideMenu({ isOpen, onClose }) {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = profile?.role;
  const homePath =
    role === 'admin' ? '/admin' : role === 'lider' ? '/lider' : '/empleado';

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

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
        {/* Cabecera */}
        <div style={styles.profileHeader}>
          <p style={styles.profileName}>{profile?.name || 'Usuario'}</p>
          <p style={styles.profileEmail}>{user?.email || 'usuario@ejemplo.com'}</p>
        </div>

        {/* Items del menú */}
        <nav style={styles.nav}>
          <MenuItem
            icon={<Home size={18} />}
            label="Contador"
            active={isActive(homePath)}
            onClick={() => go(homePath)}
          />
          {role !== 'lider' && role !== 'admin' && (
            <MenuItem
              icon={<BarChart3 size={18} />}
              label="Métricas"
              active={isActive('/metricas')}
              onClick={() => go('/metricas')}
            />
          )}
          {role === 'admin' && (
          <MenuItem
            icon={<Users size={18} />}
            label="Usuarios"
            active={isActive('/admin/usuarios')}
            onClick={() => go('/admin')} // temporal, mañana lo separamos
          />
          )}
          <MenuItem
            icon={<SettingsIcon size={18} />}
            label="Ajustes"
            active={isActive('/ajustes')}
            onClick={() => go('/ajustes')}
          />
          <MenuItem
            icon={<LogOut size={18} />}
            label="Cerrar sesión"
            active={false}
            danger
            onClick={handleLogout}
          />

        </nav>

        {/* Rol al pie */}
        <div style={styles.footer}>
          <span style={styles.roleBadge}>{roleLabel(profile?.role)}</span>
        </div>
      </aside>
    </>
  );
}

function MenuItem({ icon, label, active, danger = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`side-menu-item ${danger ? 'is-danger' : ''} ${
        active ? 'is-active' : ''
      }`}
    >
      <span className="side-menu-bar" />
      <span className="side-menu-icon">{icon}</span>
      <span className="side-menu-label">{label}</span>
      <span className="side-menu-chevron">
        <ChevronRight size={14} />
      </span>
    </button>
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
    top: '72px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,20,40,0.3)',
    zIndex: 99,
    transition: 'opacity 0.25s ease',
  },
  panel: {
    position: 'fixed',
    top: '72px',
    left: 0,
    width: '300px',
    height: 'calc(100vh - 72px)',
    background: 'var(--bg-card)',
    boxShadow: '4px 0 20px rgba(0,20,40,0.1)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },

   profileHeader: {
    padding: '20px 20px 16px 20px',
    borderBottom: '1px solid var(--border-soft)',
    background: `linear-gradient(90deg, var(--primary), var(--primary-hover))`,
  },
  profileName: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2,
  },
  profileEmail: {
    margin: '4px 0 0 0',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // Navegación
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    flex: 1,
  },

  // Footer con rol
  footer: {
    padding: '12px 20px 16px 20px',
    borderTop: '1px solid var(--border-soft)',
    display: 'flex',
    justifyContent: 'center',
  },
  roleBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--primary)',
    background: 'var(--primary-soft)',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
};