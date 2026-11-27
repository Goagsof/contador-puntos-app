import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import ThemeToggle from '../components/ThemeToggle';

const ACCENT_OPTIONS = [
  { key: 'azul', label: 'Azul', swatch: '#3b82f6' },
  { key: 'green', label: 'Verde', swatch: '#22c55e' },
  { key: 'lila', label: 'Lila', swatch: '#a78bfa' },
  { key: 'menta', label: 'Menta', swatch: '#2dd4bf' },
  { key: 'amarillo', label: 'Amarillo', swatch: '#eab308' },
  { key: 'naranja', label: 'Naranja', swatch: '#f97316' },
  { key: 'rosa', label: 'Rosa', swatch: '#ec4899' },
  { key: 'celeste', label: 'Celeste', swatch: '#0ea5e9' },
];

export default function Settings() {
  const { user, profile, logout } = useAuth();
  const { theme, accent, setAccent } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // Cambio de contraseña
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [savingPass, setSavingPass] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setSavingPass(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPass);
      setPassMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      let msg = 'No se pudo cambiar la contraseña.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'La contraseña actual es incorrecta.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La nueva contraseña es demasiado débil.';
      } else if (err.code === 'auth/requires-recent-login') {
        msg = 'Por seguridad, vuelve a iniciar sesión e intenta de nuevo.';
      }
      setPassMsg({ type: 'error', text: msg });
    } finally {
      setSavingPass(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <Header
        title="Ajustes"
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />
      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigateMetrics={() => { setMenuOpen(false); navigate('/metricas'); }}
      />

      <div style={styles.container}>
        {/* Columna izquierda */}
        <div style={styles.col}>
          {/* Cuenta */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Cuenta</h2>
            <p style={styles.row}>
              <span style={styles.label}>Nombre</span>
              <span style={styles.value}>{profile?.name || '—'}</span>
            </p>
            <p style={styles.row}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user?.email || '—'}</span>
            </p>
            <p style={styles.row}>
              <span style={styles.label}>Rol</span>
              <span style={styles.value}>{profile?.role || '—'}</span>
            </p>
          </section>

          {/* Apariencia */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Apariencia</h2>

            <div style={styles.row}>
              <span style={styles.label}>Modo</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ ...styles.value, fontSize: '0.85rem' }}>
                  {theme === 'dark' ? 'Oscuro' : 'Claro'}
                </span>
                <ThemeToggle />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <p style={{ ...styles.label, marginBottom: '10px' }}>Color de acento</p>
              <div style={styles.accentGrid}>
                {ACCENT_OPTIONS.map((opt) => {
                  const active = accent === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setAccent(opt.key)}
                      title={opt.label}
                      style={{
                        ...styles.accentBtn,
                        background: opt.swatch,
                        borderColor: active ? 'var(--text-h)' : 'transparent',
                        outline: active ? '2px solid var(--text-h)' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {active && <span style={styles.check}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <p style={styles.hint}>
                El color se guarda en este navegador y se aplica a botones y acentos.
              </p>
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div style={styles.col}>
          {/* Cambiar contraseña */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Cambiar contraseña</h2>

            <form onSubmit={handleChangePassword} style={styles.form}>
              <label style={styles.formLabel}>
                Contraseña actual
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="current-password"
                />
              </label>

              <label style={styles.formLabel}>
                Nueva contraseña
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  style={styles.input}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              <label style={styles.formLabel}>
                Confirmar nueva contraseña
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={styles.input}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {passMsg && (
                <p
                  style={{
                    ...styles.msg,
                    color: passMsg.type === 'ok' ? 'var(--success)' : 'var(--danger-text)',
                    background: passMsg.type === 'ok' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    borderColor: passMsg.type === 'ok' ? 'var(--success-border)' : 'var(--danger-border)',
                  }}
                >
                  {passMsg.text}
                </p>
              )}

              <button type="submit" disabled={savingPass} style={styles.primaryBtn}>
                {savingPass ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </section>

          {/* Sesión */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Sesión</h2>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 16px 48px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
    textAlign: 'left',
  },
  sectionTitle: {
    margin: '0 0 14px 0',
    fontSize: '1.05rem',
    color: 'var(--text-h)',
    borderBottom: '1px solid var(--border-soft)',
    paddingBottom: '8px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    margin: 0,
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--text-soft)',
    fontWeight: 500,
  },
  value: {
    fontSize: '0.9rem',
    color: 'var(--text-h)',
    fontWeight: 600,
  },
  toggleBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  accentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '10px',
  },
  accentBtn: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s',
  },
  check: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
  },
  hint: {
    marginTop: '10px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
    fontWeight: 500,
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  msg: {
    margin: 0,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.82rem',
    textAlign: 'center',
  },
  primaryBtn: {
    padding: '12px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
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