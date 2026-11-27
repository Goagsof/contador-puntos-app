import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function Maintenance() {
  const { config } = useConfig();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // Si el admin entra aquí, lo mandamos a /admin
  if (profile?.role === 'admin') {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconBox}>
          <Wrench size={42} color="var(--primary)" />
        </div>
        <h1 style={styles.title}>App en mantenimiento</h1>
        <p style={styles.subtitle}>
          {config.maintenanceMessage ||
            'Estamos realizando tareas de mantenimiento. Vuelve a intentarlo más tarde.'}
        </p>
        {user && (
          <button onClick={handleLogout} style={styles.btn}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: 'var(--shadow)',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
  },
  iconBox: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px auto',
    borderRadius: '50%',
    background: 'var(--primary-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 10px 0',
    color: 'var(--text-h)',
    fontSize: '1.4rem',
  },
  subtitle: {
    color: 'var(--text-soft)',
    fontSize: '0.9rem',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  btn: {
    padding: '10px 24px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};