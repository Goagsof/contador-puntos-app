import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

const GOAL = 8;
const COLOR_GOOD = '#1e7e34';
const COLOR_BAD = '#c0392b';
const COLOR_EMPTY = '#94a3b8';

export default function TeamBarChart({ employeeStats, onSelectEmployee }) {
  // Ordenar por total descendente para que los que más producen aparezcan primero
  const data = [...employeeStats]
    .sort((a, b) => b.total - a.total)
    .map((e) => ({
      id: e.id,
      name: e.name?.split(' ')[0] || '?', // solo primer nombre para el eje X
      fullName: e.name || 'Sin nombre',
      total: Number(e.total.toFixed(3)),
      quality: Number(e.quality.toFixed(1)),
      reachedGoal: e.reachedGoal,
      hasData: e.hasData,
    }));

  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
        No hay empleados en este equipo.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
        barCategoryGap="25%"
      >
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, Math.max(10, ...data.map((d) => d.total + 1))]}
        />
        <ReferenceLine
          y={GOAL}
          stroke="var(--success)"
          strokeDasharray="4 4"
          label={{
            value: `Meta ${GOAL}`,
            position: 'right',
            fill: 'var(--success)',
            fontSize: 11,
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={tooltipStyles.box}>
                <div style={tooltipStyles.title}>{d.fullName}</div>
                <div style={tooltipStyles.row}>
                  <span style={tooltipStyles.label}>Total:</span>
                  <span style={tooltipStyles.value}>{d.total.toFixed(3)} pts</span>
                </div>
                <div style={tooltipStyles.row}>
                  <span style={tooltipStyles.label}>Calidad:</span>
                  <span
                    style={{
                      ...tooltipStyles.value,
                      color: d.quality >= 83 ? COLOR_GOOD : COLOR_BAD,
                    }}
                  >
                    {d.quality.toFixed(1)}%
                  </span>
                </div>
                {d.hasData && (
                  <div style={tooltipStyles.hint}>Clic para ver detalle</div>
                )}
              </div>
            );
          }}
        />
        <Bar
          dataKey="total"
          radius={[6, 6, 0, 0]}
          onClick={(d) => onSelectEmployee(d.id)}
          style={{ cursor: 'pointer' }}
        >
          {data.map((d) => (
            <Cell
              key={d.id}
              fill={
                !d.hasData
                  ? COLOR_EMPTY
                  : d.reachedGoal
                  ? COLOR_GOOD
                  : COLOR_BAD
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const tooltipStyles = {
  box: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    boxShadow: 'var(--shadow)',
    minWidth: '160px',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-h)',
    marginBottom: '6px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    marginBottom: '2px',
  },
  label: { color: 'var(--text-soft)' },
  value: { fontWeight: 700, color: 'var(--text-h)' },
  hint: {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-soft)',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
};