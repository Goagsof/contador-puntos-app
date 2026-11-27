import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../context/CasesContext';
import { departmentOperations, QUALITY_THRESHOLD } from '../data/departments';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import MetricsChart from '../components/MetricsChart';
import MetricsSummary from '../components/MetricsSummary';
import MetricsByType from '../components/MetricsByType';
import { useNavigate } from 'react-router-dom';
import {
  getPeriodDays,
  groupCasesByDay,
  dateKey,
  casePoints,
  isExtra,
  PERIOD_START,
  PERIOD_END,
} from '../utils/metricsHelpers';

export default function MetricsPage() {
  const { profile } = useAuth();
  const { cases, getDowntimeRange, ensureDowntimeForEmptyDays } = useCases();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem('metrics-view') || 'combined');
  const [downtimeMap, setDowntimeMap] = useState({});
  const [loadingDt, setLoadingDt] = useState(true);
  const [ensured, setEnsured] = useState(false);

  useEffect(() => {
    localStorage.setItem('metrics-view', view);
  }, [view]);

  useEffect(() => {
    if (ensured) return;
    let cancelled = false;
    (async () => {
      try {
        await ensureDowntimeForEmptyDays(PERIOD_START, PERIOD_END, cases);
        const map = await getDowntimeRange(PERIOD_START, PERIOD_END);
        if (!cancelled) {
          setDowntimeMap(map);
          setLoadingDt(false);
          setEnsured(true);
        }
      } catch (err) {
        console.error('Error cargando downtime del período:', err);
        if (!cancelled) setLoadingDt(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ensured, cases, ensureDowntimeForEmptyDays, getDowntimeRange]);

  const daysData = useMemo(() => {
    const days = getPeriodDays();
    const byDay = groupCasesByDay(cases);
    return days.map((d) => {
      const key = dateKey(d);
      return {
        date: d,
        cases: byDay[key] || [],
        downtime: downtimeMap[key] ?? 0,
      };
    });
  }, [cases, downtimeMap]);

  const totals = useMemo(() => {
    let productionPts = 0;
    let extraPts = 0;
    let casesCount = 0;
    let modelingCases = 0;
    let reworkNuevo = 0;
    let reworkRepetido = 0;

    cases.forEach((c) => {
      const ts = c.timestamp?.toDate?.();
      if (!ts) return;
      const key = dateKey(ts);
      if (key < PERIOD_START || key > PERIOD_END) return;

      casesCount++;
      const pts = casePoints(c);
      if (isExtra(ts)) {
        extraPts += pts;
      } else {
        productionPts += pts;
        if (['Modeling', 'DI', 'QC'].includes(c.type)) {
          modelingCases++;
          if (c.isRework && c.reworkType === 'nuevo') reworkNuevo++;
          if (c.isRework && c.reworkType === 'repetido') reworkRepetido++;
        }
      }
    });

    let dtTotal = 0;
    Object.values(downtimeMap).forEach((v) => { dtTotal += v || 0; });

    const totalPts = productionPts + dtTotal;

    let avgQuality = 100;
    if (modelingCases > 0) {
      const approved = modelingCases - reworkNuevo;
      avgQuality = Math.max(0, (approved / modelingCases) * 100);
      avgQuality = Math.max(0, avgQuality - reworkRepetido * 0.1);
    }

    return { totalPts, extraPts, casesCount, dtTotal, avgQuality };
  }, [cases, downtimeMap]);

  const handleNavigateMetrics = () => {
    setMenuOpen(false);
    navigate('/metricas');
  };

  return (
    <div style={styles.page}>
      <Header
        title="Métricas"
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigateMetrics={handleNavigateMetrics}
      />

      <div style={styles.container}>
        <MetricsSummary
          totalPts={totals.totalPts}
          totalCases={totals.casesCount}
          avgQuality={totals.avgQuality}
          totalDowntime={totals.dtTotal}
          totalExtras={totals.extraPts}
        />

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Producción por día</h2>
            <div style={styles.toggle}>
              <button
                onClick={() => setView('combined')}
                style={{ ...styles.toggleBtn, ...(view === 'combined' ? styles.toggleActive : {}) }}
              >
                Combinado
              </button>
              <button
                onClick={() => setView('by-type')}
                style={{ ...styles.toggleBtn, ...(view === 'by-type' ? styles.toggleActive : {}) }}
              >
                Por tipo
              </button>
            </div>
          </div>
          {loadingDt ? (
            <p style={styles.loading}>Cargando datos...</p>
          ) : (
            <MetricsChart daysData={daysData} view={view} downtimeMap={downtimeMap} />
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Desglose por tipo</h2>
          <MetricsByType cases={cases.filter((c) => {
            const ts = c.timestamp?.toDate?.();
            if (!ts) return false;
            const key = dateKey(ts);
            return key >= PERIOD_START && key <= PERIOD_END && !isExtra(ts);
          })} />
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
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px 16px 48px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
    paddingBottom: '8px',
    borderBottom: '2px solid var(--border-soft)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-h)',
  },
  toggle: {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-soft)',
    padding: '4px',
    borderRadius: '10px',
  },
  toggleBtn: {
    padding: '6px 14px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-soft)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleActive: {
    background: 'var(--bg-card)',
    color: 'var(--text-h)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  loading: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px',
  },
};