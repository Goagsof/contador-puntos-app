import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../context/CasesContext';
import { getAllowedDepartments } from '../data/rolePermissions';
import OperationsPanel from '../components/OperationsPanel';
import CodeModal from '../components/CodeModal';
import SummaryPanel from '../components/SummaryPanel';
import HistoryPanel from '../components/HistoryPanel';
import ControlPanel from '../components/ControlPanel';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';

export default function EmployeeDashboard() {
  const { profile } = useAuth();
  const { addCase } = useCases();
  const navigate = useNavigate();

  const [pendingOperation, setPendingOperation] = useState(null);
  const [pendingDepartment, setPendingDepartment] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const allowedDepartments = getAllowedDepartments(profile?.role);

  const handleOperationClick = (operation, depKey) => {
    setPendingOperation(operation);
    setPendingDepartment(depKey);
  };

  const saveCase = async (code) => {
    try {
      await addCase({
        code,
        type: pendingOperation.type,
        description: pendingOperation.description,
        points: pendingOperation.points,
        department: pendingDepartment,
      });
      setPendingOperation(null);
      setPendingDepartment(null);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el caso: ' + err.message);
    }
  };

  const handleConfirmCode = (code) => saveCase(code);
  const handleOmitCode = () => saveCase(`AUTO-${Date.now().toString().slice(-6)}`);

const handleNavigateMetrics = () => {
  setMenuOpen(false);
  navigate('/metricas');
};

  const headerDepartment =
    profile?.role === 'di' ? 'DI' : profile?.role === 'qc' ? 'QC' : 'Modeling';

  return (
    <div style={styles.page}>
      <Header
        title="Contador de Puntos"
        showDepartment
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigateMetrics={handleNavigateMetrics}
      />

      <main style={styles.main}>
        <div style={styles.twoCols}>
          <section style={{ ...styles.card, ...styles.leftCard }}>
            <OperationsPanel
              departments={allowedDepartments}
              onOperationClick={handleOperationClick}
            />
          </section>

          <aside style={styles.rightCol}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Resumen</h2>
              <SummaryPanel />
            </div>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Controles</h2>
              <ControlPanel />
            </div>
          </aside>
        </div>

        <section style={{ ...styles.card, marginTop: '24px' }}>
          <h2 style={styles.sectionTitle}>Historial de Casos</h2>
          <HistoryPanel />
        </section>
      </main>

      <CodeModal
        isOpen={!!pendingOperation}
        operation={pendingOperation}
        onConfirm={handleConfirmCode}
        onOmit={handleOmitCode}
        onCancel={() => {
          setPendingOperation(null);
          setPendingDepartment(null);
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    color: 'var(--text)',
  },
  main: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  twoCols: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr',
    gap: '24px',
    alignItems: 'stretch',
  },
  leftCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    padding: '20px',
    boxShadow: 'var(--shadow)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-h)',
    marginBottom: '14px',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--border-soft)',
  },
};