import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatBRL } from '../store.js'

function TipRow({ color, label, value }) {
  return (
    <div className="chart-tip-row">
      <span className="dot" style={{ background: color }} />
      <span>{label}</span>
      <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function PeriodTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tip">
      <div className="chart-tip-title" style={{ textTransform: 'capitalize' }}>
        {d.label} {d.isToday ? '· hoje' : ''}
      </div>
      <TipRow color="var(--accent)" label="Vendidos" value={d.units} />
      <TipRow color="var(--green)" label="Receita" value={formatBRL(d.revenue)} />
    </div>
  )
}

function FlowTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tip">
      <div className="chart-tip-title" style={{ textTransform: 'capitalize' }}>
        {d.label} {d.isToday ? '· hoje' : ''}
      </div>
      <TipRow color="var(--green)" label="Entraram" value={`+${d.ins}`} />
      <TipRow color="var(--red)" label="Saíram" value={`−${d.outs}`} />
    </div>
  )
}

export function PeriodChart({ data }) {
  const max = Math.max(1, ...data.map(d => d.units))
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10.5, fill: 'var(--muted)', textTransform: 'capitalize' }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          domain={[0, max]}
          tick={{ fontSize: 10.5, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: 'var(--hover)' }} content={<PeriodTooltip />} />
        <Bar dataKey="units" radius={[5, 5, 0, 0]} barSize={22} animationDuration={450}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.isToday ? 'var(--accent)' : 'var(--border-strong)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FlowChart({ data }) {
  const max = Math.max(1, ...data.flatMap(d => [d.ins, d.outs]))
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barGap={3}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10.5, fill: 'var(--muted)', textTransform: 'capitalize' }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          domain={[0, max]}
          tick={{ fontSize: 10.5, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: 'var(--hover)' }} content={<FlowTooltip />} />
        <Bar dataKey="ins" radius={[4, 4, 0, 0]} barSize={9} fill="var(--green)" fillOpacity={0.85} animationDuration={450} />
        <Bar dataKey="outs" radius={[4, 4, 0, 0]} barSize={9} fill="var(--red)" fillOpacity={0.8} animationDuration={450} />
      </BarChart>
    </ResponsiveContainer>
  )
}