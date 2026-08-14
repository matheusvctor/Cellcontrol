import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react'

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function StockBadge({ quantity, minStock }) {
  if (quantity === 0) return <span className="badge bad">Esgotado</span>
  if (quantity <= minStock) return <span className="badge warn">Estoque baixo</span>
  return <span className="badge ok">Em estoque</span>
}

export function MovementBadge({ type }) {
  return type === 'in' ? (
    <span className="badge in">Entrada</span>
  ) : (
    <span className="badge out">Saída</span>
  )
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      {icon}
      <p style={{ fontWeight: 600, color: 'var(--text)' }}>{title}</p>
      {sub && <p style={{ fontSize: 13 }}>{sub}</p>}
      {action}
    </div>
  )
}

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const push = useCallback((message, type = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3200)
  }, [])

  const icons = {
    success: <CheckCircle2 size={17} />,
    error: <XCircle size={17} />,
    warn: <AlertTriangle size={17} />,
  }

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            {icons[t.type] || icons.success}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}