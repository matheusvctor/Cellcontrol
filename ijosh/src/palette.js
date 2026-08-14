const PALETTE = [
  ['#5b5bd6', '#8b5cf6'],
  ['#0f9d58', '#0a7a42'],
  ['#d93025', '#b3261e'],
  ['#1a73e8', '#1565c0'],
  ['#c026d3', '#9333ea'],
  ['#e8710a', '#c25e08'],
  ['#0d9488', '#0f766e'],
  ['#334155', '#1e293b'],
]

export function colorFor(brand) {
  let hash = 0
  for (let i = 0; i < brand.length; i++) {
    hash = (hash * 31 + brand.charCodeAt(i)) >>> 0
  }
  const [c1, c2] = PALETTE[hash % PALETTE.length]
  return `linear-gradient(135deg, ${c1}, ${c2})`
}