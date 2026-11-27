// Utilidades para la pantalla de Métricas

// ⚠️ Estos valores son el fallback si no hay config en Firestore.
// La app lee el período real desde ConfigContext.
export const PERIOD_START_FALLBACK = '2026-11-23';
export const PERIOD_END_FALLBACK = '2026-12-05';
export const PERIOD_GOAL_FALLBACK = 80;

// Estas constantes se mantienen para no romper las imports existentes,
// pero la app debería usar useConfig() para obtener el período real.
export const PERIOD_START = PERIOD_START_FALLBACK;
export const PERIOD_END = PERIOD_END_FALLBACK;
export const PERIOD_GOAL = PERIOD_GOAL_FALLBACK;

export const COLORS = {
  unbonded: '#ADD9BD',
  therapeutic: '#D98E04',
  diagnostics: '#F2D544',
  retainer: '#6B87BF',
  cts: '#9CA3AF',          // gris para todos los CT's
  downtime: '#8B5CF6',     // violeta
  extra: '#EF4444',        // rojo
  production: '#22C55E',   // verde
  productionBad: '#EF4444',// rojo
};

// Clasifica un caso en una categoría visual
export function classifyCase(c) {
  const d = (c.description || '').toLowerCase();

  if (d.startsWith("ct's") || d.startsWith('cts')) return 'cts';
  if (d.includes('diag')) return 'diagnostics';
  if (d.includes('unbonded')) return 'unbonded';
  if (d.includes('therapeutic')) return 'therapeutic';
  if (d.includes('retainer')) return 'retainer';
  return 'other';
}

// ¿Es extra? (sábado siempre, o después de 15:40 en turno A)
export function isExtra(date) {
  const day = date.getDay(); // 0=dom, 6=sáb
  if (day === 6) return true;
  if (day === 0) return false;
  const hours = date.getHours() + date.getMinutes() / 60;
  return hours > 15.666; // después de 15:40
}

// Devuelve el rango de días del período (incluye sábados y domingos)
export function getPeriodDays() {
  const days = [];
  const start = new Date(PERIOD_START + 'T00:00:00');
  const end = new Date(PERIOD_END + 'T23:59:59');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// Formatea fecha a YYYY-MM-DD
export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Etiqueta corta para el eje X ("Lun 23")
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export function dayLabel(d) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
}

// Agrupa los casos por día YYYY-MM-DD
export function groupCasesByDay(cases) {
  const map = {};
  cases.forEach((c) => {
    const ts = c.timestamp?.toDate?.();
    if (!ts) return;
    const key = dateKey(ts);
    if (!map[key]) map[key] = [];
    map[key].push(c);
  });
  return map;
}

// Calcula el total de puntos de un caso (excluye rework nuevo, que resta)
export function casePoints(c) {
  if (c.isRework && c.reworkType === 'nuevo') return 0;
  return c.points || 0;
}