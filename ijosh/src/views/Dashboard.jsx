import { lazy, Suspense, useMemo } from 'react'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, PackageSearch, PieChart, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { EmptyState, MovementBadge, StockBadge } from '../components.jsx'
import { formatBRL, formatDate } from '../store.js'
import { colorFor } from '../palette.js'

const BestSellersChart = lazy(() => import('./BestSellersChart.jsx'))
const PeriodChart = lazy(() => import('./SalesCharts.jsx').then(m => ({ default: m.PeriodChart })))
const FlowChart = lazy(() => import('./SalesCharts.jsx').then(m => ({ default: m.FlowChart })))

function StatCard({ icon, tone, label, value, foot }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  )
}

function dayKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function lastNDays(n) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(d)
  }
  return days
}

export default function Dashboard({ store, onNavigate }) {
  const s = store.stats()

  const totals = useMemo(() => {
    const t = {
      revenue7: 0,
      saleEvents: 0,
      today: null,
      yesterday: null,
      period: [],
    }
    const days = lastNDays(7).map(date => ({
      key: dayKey(date),
      label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace(',', ''),
      date,
      units: 0,
      revenue: 0,
      ins: 0,
      outs: 0,
      isToday: dayKey(date) === dayKey(new Date()),
    }))
    const byKey = new Map(days.map(d => [d.key, d]))

    const priceOf = id => store.products.find(p => p.id === id)?.price || 0
    for (const m of store.movements) {
      const day = byKey.get(dayKey(m.date))
      if (!day) continue
      if (m.type === 'in') {
        day.ins += m.quantity
        continue
      }
      day.outs += m.quantity
      const isSale = (m.reason || '').trim().toLowerCase() === 'venda'
      if (isSale) {
        day.units += m.quantity
        day.revenue += m.quantity * priceOf(m.productId)
        t.saleEvents += 1
      }
    }

    t.revenue7 = days.reduce((acc, d) => acc + d.revenue, 0)
    t.period = days
    t.yesterday = days[days.length - 2]
    t.today = days[days.length - 1]
    return t
  }, [store.movements, store.products])

  const ticket = totals.saleEvents > 0 ? totals.revenue7 / totals.saleEvents : 0
  const delta = totals.yesterday && totals.yesterday.revenue > 0
    ? Math.round(((totals.today.revenue - totals.yesterday.revenue) / totals.yesterday.revenue) * 100)
    : totals.today.revenue > 0
      ? null
      : 0

  const total = Math.max(1, s.totalItems)
  const categories = [...new Map(store.products.map(p => [p.category, 0])).keys()]
    .map(cat => {
      const items = store.products.filter(p => p.category === cat)
      const qty = items.reduce((acc, p) => acc + p.quantity, 0)
      return { cat, qty, count: items.length, pct: Math.round((qty / total) * 100) }
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  const bestSellers = useMemo(() => {
    const byProduct = new Map()
    for (const m of store.movements) {
      if (m.type !== 'out' || (m.reason || '').trim().toLowerCase() !== 'venda') continue
      const cur = byProduct.get(m.productId) || { id: m.productId, name: m.productName, units: 0, revenue: 0 }
      cur.units += m.quantity
      byProduct.set(m.productId, cur)
    }
    return [...byProduct.values()]
      .map(p => ({ ...p, revenue: p.units * (store.products.find(x => x.id === p.id)?.price || 0) }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 6)
  }, [store.movements, store.products])

  const restock = useMemo(
    () =>
      store.products
        .filter(p => p.quantity <= p.minStock)
        .map(p => {
          const toOrder = Math.max(0, p.minStock * 2 - p.quantity)
          return { ...p, toOrder, orderValue: toOrder * p.price }
        })
        .sort((a, b) => b.orderValue - a.orderValue),
    [store.products]
  )
  const restockTotal = restock.reduce((acc, r) => acc + r.orderValue, 0)
  const restockUnits = restock.reduce((acc, r) => acc + r.toOrder, 0)

  const totalSold = bestSellers.reduce((acc, b) => acc + b.units, 0)
  const alertPct = s.totalProducts > 0 ? Math.round((s.lowStock.length / s.totalProducts) * 100) : 0

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">Visão geral do estoque da I Josh</p>
        </div>
        <button className="btn primary" onClick={() => onNavigate('movements')}>
          <ArrowUpFromLine size={14} />
          Nova movimentação
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<Boxes size={14} />}
          tone="violet"
          label="Produtos cadastrados"
          value={s.totalProducts}
          foot={
            <>
              <span className="chip gray">
                {s.totalItems} {s.totalItems === 1 ? 'item' : 'itens'}
              </span>
              <span>no total</span>
            </>
          }
        />
        <StatCard
          icon={<Wallet size={14} />}
          tone="green"
          label="Valor em estoque"
          value={formatBRL(s.totalValue)}
          foot={
            <>
              <span className="chip green">preço de venda</span>
              <span>por unidade</span>
            </>
          }
        />
        <StatCard
          icon={<AlertTriangle size={14} />}
          tone="amber"
          label="Estoque baixo"
          value={s.lowStock.length}
          foot={
            <>
              {s.outOfStock.length > 0 ? (
                <span className="chip red">{s.outOfStock.length} esgotado(s)</span>
              ) : (
                <span className="chip green">sem esgotados</span>
              )}
              <span>{alertPct}% do catálogo</span>
            </>
          }
        />
        <StatCard
          icon={<ShoppingCart size={14} />}
          tone="violet"
          label="Receita · 7 dias"
          value={formatBRL(totals.revenue7)}
          foot={
            <>
              <span className="chip violet">
                ticket {formatBRL(ticket)}
              </span>
              <span>{totals.saleEvents} {totals.saleEvents === 1 ? 'venda' : 'vendas'}</span>
            </>
          }
        />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <PackageSearch size={13} />
              </span>
              Previsão de reposição
            </h2>
            <button className="btn sm ghost" onClick={() => onNavigate('products')}>
              Ver todos <span aria-hidden>→</span>
            </button>
          </div>
          {restock.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={20} />}
              title="Tudo em ordem"
              sub="Nenhum produto abaixo do mínimo"
            />
          ) : (
            <div>
              {restock.slice(0, 6).map(p => (
                <div className="list-item" key={p.id}>
                  <div className="avatar" style={{ background: colorFor(p.brand) }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="grow">
                    <div className="name">{p.name}</div>
                    <div className="sub">
                      {p.brand} · atual {p.quantity} · mín. {p.minStock}
                    </div>
                  </div>
                  <StockBadge quantity={p.quantity} minStock={p.minStock} />
                  <div className="restock-col">
                    <div className="qty" style={{ color: 'var(--accent)' }}>
                      +{p.toOrder}
                    </div>
                    <div className="sub" style={{ color: 'var(--green)', fontWeight: 600 }}>
                      {formatBRL(p.orderValue)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="card-foot">
                <span>
                  {restockUnits} {restockUnits === 1 ? 'unidade para repor' : 'unidades para repor'}
                </span>
                <span>
                  pedido: <b>{formatBRL(restockTotal)}</b>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <TrendingUp size={13} />
              </span>
              Vendas · 7 dias
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="chip violet">hoje {formatBRL(totals.today.revenue)}</span>
              {delta !== null && delta !== 0 && (
                <span className={`chip ${delta > 0 ? 'green' : 'red'}`}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}% vs ontem
                </span>
              )}
            </div>
          </div>
          {totals.revenue7 === 0 ? (
            <EmptyState
              icon={<TrendingUp size={20} />}
              title="Sem vendas nos últimos 7 dias"
              sub="Registre saídas com motivo Venda para ver o gráfico"
            />
          ) : (
            <div className="chart-box">
              <Suspense
                fallback={
                  <div className="chart-box" style={{ height: 190, display: 'grid', placeItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 12 }}>Carregando gráfico...</span>
                  </div>
                }
              >
                <PeriodChart data={totals.period} />
              </Suspense>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <ArrowDownToLine size={13} />
              </span>
              Entradas vs saídas
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="chip green">
                <ArrowDownToLine size={11} /> entraram
              </span>
              <span className="chip red">
                <ArrowUpFromLine size={11} /> saíram
              </span>
            </div>
          </div>
          <div className="chart-box">
            <Suspense
              fallback={
                <div className="chart-box" style={{ height: 150, display: 'grid', placeItems: 'center' }}>
                  <span className="muted" style={{ fontSize: 12 }}>Carregando gráfico...</span>
                </div>
              }
            >
              <FlowChart data={totals.period} />
            </Suspense>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <TrendingUp size={13} />
              </span>
              Mais vendidos
            </h2>
            <span className="count-chip">
              <b>{totalSold}</b> vendas
            </span>
          </div>
          {bestSellers.length === 0 ? (
            <EmptyState
              icon={<TrendingUp size={20} />}
              title="Sem vendas ainda"
              sub="Registre saídas com motivo Venda para ver o ranking"
            />
          ) : (
            <div className="chart-box">
              <Suspense
                fallback={
                  <div className="chart-box" style={{ height: 250, display: 'grid', placeItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 12 }}>Carregando gráfico...</span>
                  </div>
                }
              >
                <BestSellersChart data={bestSellers} />
              </Suspense>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <ArrowDownToLine size={13} />
              </span>
              Últimas movimentações
            </h2>
            <button className="btn sm ghost" onClick={() => onNavigate('movements')}>
              Ver todas <span aria-hidden>→</span>
            </button>
          </div>
          {store.movements.length === 0 ? (
            <EmptyState
              icon={<ArrowDownToLine size={20} />}
              title="Sem movimentações"
              sub="Registre entradas e saídas para acompanhar"
            />
          ) : (
            <div>
              {store.movements.slice(0, 6).map(m => (
                <div className="list-item" key={m.id}>
                  <div
                    className="avatar"
                    style={{
                      background: m.type === 'in' ? 'var(--green-soft)' : 'var(--red-soft)',
                      color: m.type === 'in' ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {m.type === 'in' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                  </div>
                  <div className="grow">
                    <div className="name">{m.productName}</div>
                    <div className="sub">
                      {m.reason} · {formatDate(m.date)}
                    </div>
                  </div>
                  <MovementBadge type={m.type} />
                  <span
                    className="qty num"
                    style={{ color: m.type === 'in' ? 'var(--green)' : 'var(--red)' }}
                  >
                    {m.type === 'in' ? '+' : '−'}
                    {m.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2 className="card-title">
              <span className="icon-chip">
                <PieChart size={13} />
              </span>
              Estoque por categoria
            </h2>
            <span className="count-chip">
              <b>{s.totalItems}</b> itens
            </span>
          </div>
          {categories.length === 0 ? (
            <EmptyState icon={<PieChart size={20} />} title="Sem dados" sub="Cadastre produtos primeiro" />
          ) : (
            <div className="distro">
              {categories.map(({ cat, qty, pct }) => (
                <div className="distro-row" key={cat}>
                  <span className="name">{cat}</span>
                  <div className="bar">
                    <span style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                  </div>
                  <span className="pct">{qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}