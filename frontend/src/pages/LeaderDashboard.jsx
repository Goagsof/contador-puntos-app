import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import TeamTabs from '../components/TeamTabs';
import TeamBarChart from '../components/TeamBarChart';
import EmployeeCard from '../components/EmployeeCard';
import { useTeamData } from '../hooks/useTeamData';
import { Search } from 'lucide-react';

export default function LeaderDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    leaders,
    selectedLeaderUid,
    setSelectedLeaderUid,
    employeeStats,
    loadingLeaders,
    loadingTeam,
  } = useTeamData();

  // Filtrar por búsqueda
  const filteredStats = useMemo(() => {
    if (!searchTerm.trim()) return employeeStats;
    const term = searchTerm.toLowerCase();
    return employeeStats.filter(
      (e) =>
        (e.name || '').toLowerCase().includes(term) ||
        (e.email || '').toLowerCase().includes(term)
    );
  }, [employeeStats, searchTerm]);

  const handleSelectEmployee = (uid) => {
    navigate(`/lider/empleado/${uid}`);
  };

  const currentLeader = leaders.find((l) => l.id === selectedLeaderUid);

  return (
    <div style={styles.page}>
      <Header
        title="Panel de Líder"
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main style={styles.main}>
        {loadingLeaders ? (
          <p style={styles.loading}>Cargando equipos...</p>
        ) : (
          <>
            {/* Tabs de equipos */}
            <TeamTabs
              leaders={leaders}
              selectedUid={selectedLeaderUid}
              onChange={setSelectedLeaderUid}
            />

            <div style={styles.content}>
              {/* Encabezado del equipo actual */}
              <div style={styles.teamHeader}>
                <h2 style={styles.teamTitle}>
                  Equipo de {currentLeader?.name || '—'}
                </h2>
                <span style={styles.teamCount}>
                  {filteredStats.length} empleado{filteredStats.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Buscador */}
              <div style={styles.searchBox}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {loadingTeam ? (
                <p style={styles.loading}>Cargando empleados...</p>
              ) : employeeStats.length === 0 ? (
                <p style={styles.empty}>No hay empleados en este equipo.</p>
              ) : (
                <>
                  {/* Gráfica de barras */}
                  <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>Producción de hoy</h3>
                    <TeamBarChart
                      employeeStats={filteredStats}
                      onSelectEmployee={handleSelectEmployee}
                    />
                  </div>

                  {/* Grid de tarjetas */}
                  <div style={styles.cardsGrid}>
                    {filteredStats.map((emp) => (
                      <EmployeeCard
                        key={emp.id}
                        employee={emp}
                        onClick={() => handleSelectEmployee(emp.id)}
                      />
                    ))}
                  </div>

                  {filteredStats.length === 0 && (
                    <p style={styles.empty}>
                      No hay empleados que coincidan con "{searchTerm}".
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 16px 48px',
  },
  content: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: '14px',
    borderBottomRightRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
  },
  teamHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  teamTitle: {
    margin: 0,
    fontSize: '1.15rem',
    color: 'var(--text-h)',
  },
  teamCount: {
    fontSize: '0.8rem',
    color: 'var(--text-soft)',
    background: 'var(--bg-soft)',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    background: 'var(--bg-soft)',
    color: 'var(--text-h)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-h)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px',
    fontStyle: 'italic',
  },
};