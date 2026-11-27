import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import { Save, AlertTriangle, Power, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const { config, updateConfig } = useConfig();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    periodStart: config.periodStart,
    periodEnd: config.periodEnd,
    goal: config.goal,
    qualityThreshold: config.qualityThreshold,
    maintenanceMessage: config.maintenanceMessage,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSaveConfig = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await updateConfig(form);
      setMsg({ type: 'ok', text: 'Configuración guardada correctamente.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al guardar: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const next = !config.maintenance;
    if (next && !confirm('¿Activar modo mantenimiento? Los usuarios no-admin no podrán entrar.')) return;
    await updateConfig({ maintenance: next });
  };

  const handleDangerReset = async () => {
    const code = prompt(
      'Esto borrará TODOS los datos (casos, downtime y usuarios no-admin). Escribe "BORRAR TODO" para confirmar:'
    );
    if (code !== 'BORRAR TODO') return alert('Cancelado.');
    alert('Función de borrado se implementa en el Bloque 3.');
  };

  return (
    <div style={styles.page}>
      <Header
        title="Panel de Administrador"
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main style={styles.main}>
        {/* Configuración del período */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Configuración del período</h2>
          <div style={styles.grid2}>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Inicio del período</span>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Fin del período</span>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Meta de puntos</span>
              <input
                type="number"
                min="0"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })}
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Calidad mínima (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.qualityThreshold}
                onChange={(e) =>
                  setForm({ ...form, qualityThreshold: Number(e.target.value) })
                }
                style={styles.input}
              />
            </label>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            style={styles.primaryBtn}
          >
            <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {msg && (
            <p
              style={{
                ...styles.msg,
                color: msg.type === 'ok' ? 'var(--success)' : 'var(--danger-text)',
                background: msg.type === 'ok' ? 'var(--success-bg)' : 'var(--danger-bg)',
                borderColor:
                  msg.type === 'ok' ? 'var(--success-border)' : 'var(--danger-border)',
              }}
            >
              {msg.text}
            </p>
          )}
        </section>

        {/* Kill switch */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Modo mantenimiento</h2>
          <p style={styles.hint}>
            Cuando está activo, los usuarios no-admin verán una pantalla de mantenimiento
            y no podrán entrar.
          </p>
          <label style={styles.field}>
            <span style={styles.fieldLabel}>Mensaje a mostrar</span>
            <input
              type="text"
              value={form.maintenanceMessage}
              onChange={(e) =>
                setForm({ ...form, maintenanceMessage: e.target.value })
              }
              placeholder="Ej. App en mantenimiento, volvemos a las 3pm"
              style={styles.input}
            />
          </label>
          <button
            onClick={handleToggleMaintenance}
            style={{
              ...styles.dangerBtn,
              background: config.maintenance ? 'var(--success)' : 'var(--danger-text)',
              borderColor: config.maintenance ? 'var(--success)' : 'var(--danger-text)',
            }}
          >
            <Power size={16} />{' '}
            {config.maintenance ? 'Desactivar mantenimiento' : 'Activar mantenimiento'}
          </button>
          <p style={styles.statusText}>
            Estado actual:{' '}
            <strong style={{ color: config.maintenance ? 'var(--danger-text)' : 'var(--success)' }}>
              {config.maintenance ? 'EN MANTENIMIENTO' : 'ACTIVO'}
            </strong>
          </p>
        </section>

        {/* Zona de peligro */}
        <section style={{ ...styles.card, borderColor: 'var(--danger-border)' }}>
          <h2 style={{ ...styles.sectionTitle, color: 'var(--danger-text)' }}>
            <AlertTriangle size={18} /> Zona de peligro
          </h2>
          <p style={styles.hint}>
            Estas acciones son irreversibles. Úsalas solo si sabes lo que haces.
          </p>
          <button onClick={handleDangerReset} style={styles.dangerBtn}>
            <Trash2 size={16} /> Borrar todos los datos
          </button>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
  },
  sectionTitle: {
    margin: '0 0 14px 0',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '16px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '0.82rem', color: 'var(--text-soft)', fontWeight: 500 },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  primaryBtn: {
    padding: '10px 20px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  dangerBtn: {
    padding: '10px 20px',
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    border: '1px solid var(--danger-border)',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  msg: {
    marginTop: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.82rem',
    textAlign: 'center',
  },
  hint: {
    fontSize: '0.82rem',
    color: 'var(--text-soft)',
    margin: '0 0 12px 0',
  },
  statusText: {
    marginTop: '12px',
    fontSize: '0.82rem',
    color: 'var(--text-soft)',
  },
};