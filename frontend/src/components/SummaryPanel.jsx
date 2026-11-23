import { useCases } from '../context/CasesContext';
import { QUALITY_THRESHOLD } from '../data/departments';
import TodayDonut from './TodayDonut';

const TOTAL_GOAL = 8;
const TOTAL_COLOR_PENDING = '#1a3b66';   // azul oscuro (aún no llega)
const TOTAL_COLOR_DONE = '#1e7e34';      // verde (meta alcanzada)
const QUALITY_COLOR_GOOD = '#1e7e34';    // verde
const QUALITY_COLOR_BAD = '#c0392b';     // rojo

export default function SummaryPanel() {
  const { cases, downtime } = useCases();

  // Solo hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();

  const todayCases = cases.filter((c) => {
    const ts = c.timestamp?.toMillis?.() ?? 0;
    return ts >= startOfToday;
  });

  const modelingCases = todayCases.filter(
    (c) => c.type === 'Modeling' || c.type === 'DI' || c.type === 'QC'
  );
  const ptsCases = todayCases.filter((c) => c.type === 'PTS');

  const modelingTotal = modelingCases.reduce((acc, c) => acc + (c.points || 0), 0);
  const ptsTotal = ptsCases.reduce((acc, c) => acc + (c.points || 0), 0);
  const total = modelingTotal + ptsTotal + (downtime || 0);

  // Calidad
  const totalCases = modelingCases.length;
  const reworkNuevo = modelingCases.filter(
    (c) => c.isRework && c.reworkType === 'nuevo'
  ).length;
  const reworkRepetido = modelingCases.filter(
    (c) => c.isRework && c.reworkType === 'repetido'
  ).length;

  let quality = 100;
  if (totalCases > 0) {
    const approved = totalCases - reworkNuevo;
    quality = Math.max(0, (approved / totalCases) * 100);
    quality = Math.max(0, quality - reworkRepetido * 0.1);
  }

  const totalReached = total >= TOTAL_GOAL;
  const totalColor = totalReached ? TOTAL_COLOR_DONE : TOTAL_COLOR_PENDING;

  const qualityGood = quality >= QUALITY_THRESHOLD;
  const qualityColor = qualityGood ? QUALITY_COLOR_GOOD : QUALITY_COLOR_BAD;

  return (
    <div style={styles.grid}>
      <div style={styles.item}>
        <TodayDonut
          value={total}
          max={TOTAL_GOAL}
          label="Total hoy"
          color={totalColor}
          centerText={total.toFixed(3)}
          centerSubtext={totalReached ? 'meta ✓' : `meta ${TOTAL_GOAL}`}
          formatter={(v) => `${v.toFixed(3)} pts`}
        />
      </div>
      <div style={styles.item}>
        <TodayDonut
          value={quality}
          max={100}
          label="Calidad"
          color={qualityColor}
          centerText={`${quality.toFixed(1)}%`}
          centerSubtext={`objetivo ${QUALITY_THRESHOLD}%`}
          formatter={(v) => `${v.toFixed(1)}%`}
        />
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
};