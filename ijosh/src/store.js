import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ijosh_products'
const STORAGE_KEY_MOVEMENTS = 'ijosh_movements'

const seedProducts = [
  { id: 'p1', name: 'iPhone 15', brand: 'Apple', category: 'Smartphone', price: 4999, quantity: 12, minStock: 5 },
  { id: 'p2', name: 'iPhone 14', brand: 'Apple', category: 'Smartphone', price: 3899, quantity: 4, minStock: 5 },
  { id: 'p3', name: 'Galaxy S24', brand: 'Samsung', category: 'Smartphone', price: 4499, quantity: 18, minStock: 6 },
  { id: 'p4', name: 'Galaxy A54', brand: 'Samsung', category: 'Smartphone', price: 1899, quantity: 3, minStock: 8 },
  { id: 'p5', name: 'Moto G84', brand: 'Motorola', category: 'Smartphone', price: 1599, quantity: 22, minStock: 6 },
  { id: 'p6', name: 'Redmi Note 13', brand: 'Xiaomi', category: 'Smartphone', price: 1399, quantity: 9, minStock: 5 },
  { id: 'p7', name: 'Capa iPhone 15', brand: 'Genérica', category: 'Acessório', price: 59, quantity: 40, minStock: 10 },
  { id: 'p8', name: 'Película Vidro', brand: 'Genérica', category: 'Acessório', price: 29, quantity: 6, minStock: 15 },
  { id: 'p9', name: 'Carregador 20W', brand: 'Apple', category: 'Acessório', price: 249, quantity: 15, minStock: 5 },
  { id: 'p10', name: 'Fone Buds 2', brand: 'Xiaomi', category: 'Acessório', price: 199, quantity: 25, minStock: 8 },
]

const seedMovements = [
  { id: 'm1', productId: 'p1', productName: 'iPhone 15', type: 'in', quantity: 12, reason: 'Compra de fornecedor', date: '2026-08-12T10:30:00' },
  { id: 'm2', productId: 'p4', productName: 'Galaxy A54', type: 'out', quantity: 1, reason: 'Venda', date: '2026-08-13T14:05:00' },
  { id: 'm3', productId: 'p8', productName: 'Película Vidro', type: 'out', quantity: 4, reason: 'Venda', date: '2026-08-13T15:40:00' },
  { id: 'm4', productId: 'p2', productName: 'iPhone 14', type: 'in', quantity: 4, reason: 'Devolução', date: '2026-08-14T09:12:00' },
  { id: 'm5', productId: 'p3', productName: 'Galaxy S24', type: 'out', quantity: 2, reason: 'Venda', date: '2026-08-14T11:20:00' },
]

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return seed
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function useStore() {
  const [products, setProducts] = useState(() => load(STORAGE_KEY, seedProducts))
  const [movements, setMovements] = useState(() => load(STORAGE_KEY_MOVEMENTS, seedMovements))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements))
  }, [movements])

  function upsertProduct(data) {
    if (data.id) {
      setProducts(prev => prev.map(p => (p.id === data.id ? data : p)))
    } else {
      setProducts(prev => [{ ...data, id: uid('p') }, ...prev])
    }
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function registerMovement({ productId, type, quantity, reason }) {
    setMovements(prev => {
      const product = products.find(p => p.id === productId)
      const entry = {
        id: uid('m'),
        productId,
        productName: product ? product.name : 'Produto removido',
        type,
        quantity,
        reason: reason || (type === 'in' ? 'Entrada manual' : 'Saída manual'),
        date: new Date().toISOString(),
      }
      return [entry, ...prev]
    })
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: Math.max(0, p.quantity + (type === 'in' ? quantity : -quantity)) }
          : p
      )
    )
  }

  function stats() {
    const totalItems = products.reduce((acc, p) => acc + p.quantity, 0)
    const totalValue = products.reduce((acc, p) => acc + p.quantity * p.price, 0)
    const lowStock = products.filter(p => p.quantity <= p.minStock)
    const outOfStock = products.filter(p => p.quantity === 0)
    return { totalProducts: products.length, totalItems, totalValue, lowStock, outOfStock }
  }

  return { products, movements, upsertProduct, deleteProduct, registerMovement, stats, uid }
}
