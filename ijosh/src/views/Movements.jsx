import { useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Search } from 'lucide-react'
import { EmptyState, Modal, MovementBadge, useToast } from '../components.jsx'
import { formatDate } from '../store.js'
import { colorFor } from '../palette.js'

const EMPTY_MOVE = { productId: '', type: 'in', quantity: '', reason: '' }

const SUGGESTIONS = {
  in: ['Compra de fornecedor', 'Devolução', 'Transferência'],
  out: ['Venda', 'Troca', 'Perda/avaria'],
}

export default function Movements({ store }) {
  const { movements, products, registerMovement } = store
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [draft, setDraft] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return movements.filter(m => {
      const matchQ = !q || m.productName.toLowerCase().includes(q) || (m.reason || '').toLowerCase().includes(q)
      const matchT = typeFilter === 'all' || m.type === typeFilter
      return matchQ && matchT
    })
  }, [movements, search, typeFilter])

  const sumIn = movements.filter(m => m.type === 'in').reduce((a, m) => a + m.quantity, 0)
  const sumOut = movements.filter(m => m.type === 'out').reduce((a, m) => a + m.quantity, 0)

  function openNew() {
    setDraft({ ...EMPTY_MOVE, productId: products[0]?.id || '' })
  }

  function save() {
    const quantity = parseInt(draft.quantity, 10)
    const product = products.find(p => p.id === draft.productId)

    if (!product) {
      toast('Selecione um produto', 'error')
      return
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast('Informe uma quantidade válida', 'error')
      return
    }
    if (draft.type === 'out' && quantity > product.quantity) {
      toast(`Saldo insuficiente (disponível: ${product.quantity})`, 'error')
      return
    }

    registerMovement({
      productId: product.id,
      type: draft.type,
      quantity,
      reason: draft.reason.trim() || (draft.type === 'in' ? 'Entrada manual' : 'Saída manual'),
    })
    toast(draft.type === 'in' ? 'Entrada registrada' : 'Saída registrada')
    setDraft(null)
  }

  const product = products.find(p => p.id === draft?.productId)

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Movimentações</h1>
          <p className="page-desc">Histórico de entradas e saídas do estoque</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="chip green">
            <ArrowDownToLine size={11} />+{sumIn} <span className="muted" style={{ fontWeight: 500 }}>entraram</span>
          </span>
          <span className="chip red">
            <ArrowUpFromLine size={11} />−{sumOut} <span className="muted" style={{ fontWeight: 500 }}>saíram</span>
          </span>
          <button className="btn primary" onClick={openNew} disabled={products.length === 0}>
            <ArrowLeftRight size={14} />
            Registrar
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={14} />
          <input
            placeholder="Buscar por produto ou motivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">Entrada + Saída</option>
          <option value="in">Somente entradas</option>
          <option value="out">Somente saídas</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight size={20} />}
              title={movements.length === 0 ? 'Nenhuma movimentação ainda' : 'Nada encontrado'}
              sub={
                movements.length === 0
                  ? 'Registre a primeira entrada ou saída de produtos'
                  : 'Tente ajustar a busca ou o filtro'
              }
              action={
                movements.length === 0 && products.length > 0 ? (
                  <button className="btn primary" onClick={openNew}>
                    <ArrowLeftRight size={14} />
                    Registrar movimentação
                  </button>
                ) : undefined
              }
            />
          ) : (
            <table className="t-moves">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th className="text-right">Quantidade</th>
                  <th>Motivo</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const p = products.find(x => x.id === m.productId)
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="info-row">
                          <div
                            className="avatar"
                            style={{
                              background: p ? colorFor(p.brand) : 'var(--surface-alt)',
                              color: p ? '#fff' : 'var(--muted)',
                            }}
                          >
                            {m.type === 'in' ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                          </div>
                          <div className="td-main">{m.productName}</div>
                        </div>
                      </td>
                      <td>
                        <MovementBadge type={m.type} />
                      </td>
                      <td className="text-right">
                        <span
                          className="qty-cell num"
                          style={{ color: m.type === 'in' ? 'var(--green)' : 'var(--red)' }}
                        >
                          {m.type === 'in' ? '+' : '−'}
                          {m.quantity}
                        </span>
                      </td>
                      <td className="muted">{m.reason}</td>
                      <td className="muted num">{formatDate(m.date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {draft && (
        <Modal
          title="Registrar movimentação"
          onClose={() => setDraft(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={save}>
                Registrar
              </button>
            </>
          }
        >
          <div className="form-row">
            <div className="field">
              <label>Tipo</label>
              <select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value, reason: '' })}>
                <option value="in">Entrada (+)</option>
                <option value="out">Saída (−)</option>
              </select>
            </div>
            <div className="field">
              <label>Quantidade</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                autoFocus
                value={draft.quantity}
                onChange={e => setDraft({ ...draft, quantity: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Produto</label>
            <select value={draft.productId} onChange={e => setDraft({ ...draft, productId: e.target.value })}>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.brand} ({p.quantity} disp.)
                </option>
              ))}
            </select>
            {product && (
              <div className="hint">
                {draft.type === 'out' && product.quantity === 0
                  ? 'Este produto está esgotado'
                  : draft.type === 'out'
                    ? `Saldo disponível: ${product.quantity}`
                    : `Saldo atual: ${product.quantity}`}
              </div>
            )}
          </div>
          <div className="field">
            <label>Motivo</label>
            <input
              placeholder={draft.type === 'in' ? 'Ex.: compra de fornecedor' : 'Ex.: venda'}
              value={draft.reason}
              onChange={e => setDraft({ ...draft, reason: e.target.value })}
              list="reason-suggestions"
            />
            <datalist id="reason-suggestions">
              {SUGGESTIONS[draft.type].map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </Modal>
      )}
    </>
  )
}