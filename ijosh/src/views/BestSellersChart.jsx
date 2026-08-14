import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tip">
      <div className="chart-tip-title">{d.name}</div>
      <div className="chart-tip-row">
        <span className="dot" style={{ background: 'var(--accent)' }} />
        {d.units} {d.units === 1 ? 'unidade vendida' : 'unidades vendidas'}
      </div>
    </div>
  )
}

export default function BestSellersChart({ data }) {
  const topUnits = Math.max(1, ...data.map(b => b.units))
  return (
    <ResponsiveContainer width="100%" height={Math.max(170, data.length * 46)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 34, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, topUnits]}
          tick={{ fontSize: 10.5, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={118}
          tick={{ fontSize: 11.5, fill: 'var(--text-2)', fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: 'var(--hover)' }} content={<ChartTooltip />} />
        <Bar dataKey="units" radius={[0, 5, 5, 0]} barSize={14} isAnimationActive animationDuration={450}>
          {data.map((b, i) => (
            <Cell key={b.id} fill="var(--accent)" fillOpacity={1 - i * 0.11} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}