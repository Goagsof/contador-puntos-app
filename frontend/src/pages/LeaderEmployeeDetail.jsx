import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import MetricsChart from '../components/MetricsChart';
import MetricsSummary from '../components/MetricsSummary';
import MetricsByType from '../components/MetricsByType';
import {
  getPeriodDays,
  groupCasesByDay,
  dateKey,
  casePoints,
  isExtra,
  PERIOD_START,
  PERIOD_END,
} from '../utils/metricsHelpers';

export default function LeaderEmployeeDetail() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [cases, setCases] = useState([]);
  const [downtimeMap, setDowntimeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('combined');

  // Cargar perfil del empleado
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        setEmployee({ id: snap.id, ...snap.data() });
      }
    });
  }, [uid]);

  // Cargar casos del empleado
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'cases'), where('userId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCases(list);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // Cargar downtime del período
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const daysCol = collection(db, 'downtime', uid, 'days');
      const snap = await getDocs(daysCol);
      const map = {};
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const key = data.date || docSnap.id;
        if (key >= PERIOD_START && key <= PERIOD_END) {
          map[key] = data.hours || 0;
        }
      });
      setDowntimeMap(map);
    })();
  }, [uid]);

  // Calcular datos de los días
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

  // Totales del período
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

  return (
    <div style={styles.page}>
      <Header
        title={`Métricas de ${employee?.name || 'Empleado'}`}
        onMenuClick={() => setMenuOpen((v) => !v)}
        isMenuOpen={menuOpen}
      />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main style={styles.main}>
        {/* Botón volver */}
        <div style={styles.headerRow}>
          <button onClick={() => navigate('/lider')} style={styles.backBtn}>
            ← Volver al equipo
          </button>
        </div>
        {loading ? (
          <p style={styles.loading}>Cargando datos del empleado...</p>
        ) : (
          <>
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
              <MetricsChart daysData={daysData} view={view} downtimeMap={downtimeMap} />
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Desglose por tipo</h2>
              <MetricsByType
                cases={cases.filter((c) => {
                  const ts = c.timestamp?.toDate?.();
                  if (!ts) return false;
                  const key = dateKey(ts);
                  return key >= PERIOD_START && key <= PERIOD_END && !isExtra(ts);
                })}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: '20px' },
  headerRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  backBtn: {
    padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer',
  },
  employeeInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  employeeName: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-h)' },
  employeeEmail: { fontSize: '0.8rem', color: 'var(--text-soft)' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '14px', paddingBottom: '8px', borderBottom: '2px solid var(--border-soft)',
  },
  sectionTitle: { margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-h)' },
  toggle: { display: 'flex', gap: '4px', background: 'var(--bg-soft)', padding: '4px', borderRadius: '10px' },
  toggleBtn: {
    padding: '6px 14px', border: 'none', background: 'transparent',
    color: 'var(--text-soft)', borderRadius: '8px', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  },
  toggleActive: { background: 'var(--bg-card)', color: 'var(--text-h)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  loading: { textAlign: 'center', color: 'var(--text-muted)', padding: '40px' },
};