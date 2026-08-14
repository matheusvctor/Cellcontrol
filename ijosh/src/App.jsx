import { useEffect, useState } from 'react'
import { Moon, Package, LayoutDashboard, ArrowLeftRight, Sun } from 'lucide-react'
import { ToastProvider } from './components.jsx'
import { useStore } from './store.js'
import Dashboard from './views/Dashboard.jsx'
import Products from './views/Products.jsx'
import Movements from './views/Movements.jsx'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Produtos', icon: Package },
  { key: 'movements', label: 'Movimentações', icon: ArrowLeftRight },
]

const THEME_KEY = 'ijosh_theme'

function App() {
  const store = useStore()
  const [view, setView] = useState('dashboard')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const lowCount = store.stats().lowStock.length

  return (
    <ToastProvider>
      <div className="app">
        <header className="mobile-header">
          <div className="brand">
            <div className="brand-mark">iJ</div>
            <div>
              <div className="brand-name">I Josh</div>
              <div className="brand-sub">Controle de Estoque</div>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </header>

        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">iJ</div>
            <div>
              <div className="brand-name">I Josh</div>
              <div className="brand-sub">Controle de Estoque</div>
            </div>
          </div>

          <div className="nav-label">Menu</div>

          <nav>
            {NAV.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  className={`nav-btn ${view === item.key ? 'active' : ''}`}
                  onClick={() => setView(item.key)}
                >
                  <Icon size={16} />
                  {item.label}
                  {item.key === 'products' && lowCount > 0 && (
                    <span className="badge-count">{lowCount}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="sidebar-foot">
            <strong>I Josh</strong> · loja de celulares
            <div className="version">v1.0 · front-end</div>
          </div>

          <button
            className="nav-btn theme-toggle"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            {theme === 'light' ? 'Tema escuro' : 'Tema claro'}
          </button>
        </aside>

        <main className="main">
          {view === 'dashboard' && <Dashboard store={store} onNavigate={setView} />}
          {view === 'products' && <Products store={store} />}
          {view === 'movements' && <Movements store={store} />}
        </main>

        <nav className="mobile-nav">
          {NAV.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                className={view === item.key ? 'active' : ''}
                onClick={() => setView(item.key)}
              >
                <Icon size={19} />
                {item.label}
                {item.key === 'products' && lowCount > 0 && (
                  <span className="badge-count">{lowCount}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </ToastProvider>
  )
}

export default App