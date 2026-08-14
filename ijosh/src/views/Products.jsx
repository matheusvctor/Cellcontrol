import { useMemo, useState } from 'react'
import { Package, PackagePlus, Pencil, Search, Trash2 } from 'lucide-react'
import { EmptyState, Modal, StockBadge, useToast } from '../components.jsx'
import { formatBRL } from '../store.js'
import { colorFor } from '../palette.js'

const EMPTY_FORM = { id: '', name: '', brand: '', category: 'Smartphone', price: '', quantity: '', minStock: '' }
const CATEGORIES = ['Smartphone', 'Acessório', 'Carregador', 'Fone', 'Capa', 'Película', 'Outro']

export default function Products({ store }) {
  const { products, upsertProduct, deleteProduct } = store
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const brands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      const matchB = brandFilter === 'all' || p.brand === brandFilter
      const matchC = categoryFilter === 'all' || p.category === categoryFilter
      return matchQ && matchB && matchC
    })
  }, [products, search, brandFilter, categoryFilter])

  function openNew() {
    setEditing({ ...EMPTY_FORM })
  }

  function openEdit(p) {
    setEditing({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: String(p.price),
      quantity: String(p.quantity),
      minStock: String(p.minStock),
    })
  }

  function save() {
    const price = parseFloat(editing.price)
    const quantity = parseInt(editing.quantity, 10)
    const minStock = parseInt(editing.minStock, 10)

    if (!editing.name.trim() || !editing.brand.trim()) {
      toast('Preencha nome e marca do produto', 'error')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      toast('Preço inválido', 'error')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast('Quantidade inválida', 'error')
      return
    }
    if (!Number.isInteger(minStock) || minStock < 0) {
      toast('Estoque mínimo inválido', 'error')
      return
    }

    upsertProduct({
      id: editing.id,
      name: editing.name.trim(),
      brand: editing.brand.trim(),
      category: editing.category,
      price,
      quantity,
      minStock,
    })
    toast(editing.id ? 'Produto atualizado' : 'Produto cadastrado')
    setEditing(null)
  }

  function confirmDelete() {
    deleteProduct(deleting.id)
    toast('Produto removido')
    setDeleting(null)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-desc">Catálogo e controle de quantidade por item</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="count-chip">
            <b>{products.length}</b> produtos
          </span>
          <button className="btn primary" onClick={openNew}>
            <PackagePlus size={14} />
            Novo produto
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={14} />
          <input
            placeholder="Buscar por nome ou marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option value="all">Todas as marcas</option>
          {brands.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select className="filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">Todas as categorias</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={20} />}
              title={products.length === 0 ? 'Nenhum produto cadastrado' : 'Nada encontrado'}
              sub={
                products.length === 0
                  ? 'Cadastre seu primeiro produto para começar'
                  : 'Tente ajustar a busca ou os filtros'
              }
              action={
                products.length === 0 ? (
                  <button className="btn primary" onClick={openNew}>
                    <PackagePlus size={14} />
                    Novo produto
                  </button>
                ) : undefined
              }
            />
          ) : (
            <table className="t-products">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th className="text-right">Preço</th>
                  <th className="text-right">Estoque</th>
                  <th className="text-right">Mín.</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cap = Math.max(p.minStock * 2, 1)
                  const tone = p.quantity === 0 ? 'bad' : p.quantity <= p.minStock ? 'warn' : 'ok'
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="info-row">
                          <div className="avatar" style={{ background: colorFor(p.brand) }}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="td-main">{p.name}</div>
                            <div className="td-sub">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge category">{p.category}</span>
                      </td>
                      <td className="text-right num">{formatBRL(p.price)}</td>
                      <td>
                        <div className="health">
                          <span className="qty-cell">{p.quantity}</span>
                          <div className="bar">
                            <span
                              className={tone}
                              style={{ width: `${Math.min(100, Math.round((p.quantity / cap) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-right muted num">{p.minStock}</td>
                      <td>
                        <StockBadge quantity={p.quantity} minStock={p.minStock} />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => openEdit(p)} title="Editar">
                            <Pencil size={13.5} />
                          </button>
                          <button className="icon-btn danger" onClick={() => setDeleting(p)} title="Excluir">
                            <Trash2 size={13.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Editar produto' : 'Novo produto'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={save}>
                {editing.id ? 'Salvar alterações' : 'Cadastrar'}
              </button>
            </>
          }
        >
          <div className="form-row">
            <div className="field">
              <label>Nome</label>
              <input
                autoFocus
                placeholder="Ex.: iPhone 15"
                value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Marca</label>
              <input
                placeholder="Ex.: Apple"
                value={editing.brand}
                onChange={e => setEditing({ ...editing, brand: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Categoria</label>
              <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Preço de venda (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={editing.price}
                onChange={e => setEditing({ ...editing, price: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>
                Quantidade <span className="hint">em estoque</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={editing.quantity}
                onChange={e => setEditing({ ...editing, quantity: e.target.value })}
              />
            </div>
            <div className="field">
              <label>
                Estoque mínimo <span className="hint">alerta</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={editing.minStock}
                onChange={e => setEditing({ ...editing, minStock: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Excluir produto"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setDeleting(null)}>
                Cancelar
              </button>
              <button className="btn danger-ghost" onClick={confirmDelete}>
                <Trash2 size={13.5} />
                Excluir
              </button>
            </>
          }
        >
          <p className="td-main">{deleting.name}</p>
          <p className="confirm-text">
            Tem certeza? Essa ação não pode ser desfeita. O histórico de movimentações será mantido.
          </p>
        </Modal>
      )}
    </>
  )
}