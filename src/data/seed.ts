import type {
  Channel,
  JerseyColors,
  KitType,
  Pattern,
  Product,
  ProductStatus,
  Sale,
  Variant,
} from '../lib/types'
import { makeCode } from '../lib/id'
import { startOfToday } from '../lib/format'

interface SeedDef {
  name: string
  team: string
  kit: KitType
  brand: string
  category: string
  channel?: Channel
  pattern: Pattern
  colors: JerseyColors
  number?: number
  retail: number
  wholesale: number
  cost: number
  status?: ProductStatus
  returnable?: boolean
  description?: string
  season?: string
  ageDays?: number
  sizes: { size: string; stock: number }[]
}

/* A boutique football-kit room — Premier League heavy (UK), with a
 * sprinkle of European giants and two national sides. Stock is tuned so
 * the dashboard has real low-stock and out-of-stock stories to tell. */
const DEFS: SeedDef[] = [
  {
    name: 'Arsenal Home',
    team: 'Arsenal',
    kit: 'Home',
    brand: 'Adidas',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#e2231a', sleeve: '#ffffff', accent: '#001f4e' },
    number: 7,
    retail: 85,
    wholesale: 54,
    cost: 33,
    ageDays: 2,
    description: 'Authentic 24/25 home shirt. Classic red with white sleeves.',
    sizes: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 7 },
    ],
  },
  {
    name: 'Newcastle United Home',
    team: 'Newcastle United',
    kit: 'Home',
    brand: 'Adidas',
    category: 'Premier League',
    pattern: 'stripes',
    colors: { body: '#f4f4f4', sleeve: '#0b0b0b', accent: '#0b0b0b' },
    number: 9,
    retail: 80,
    wholesale: 50,
    cost: 31,
    ageDays: 5,
    description: 'The iconic black-and-white stripes of St. James’ Park.',
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 3 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 2 },
    ],
  },
  {
    name: 'Manchester City Home',
    team: 'Manchester City',
    kit: 'Home',
    brand: 'Puma',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#6cabdd', sleeve: '#6cabdd', accent: '#1c2c5b' },
    number: 9,
    retail: 80,
    wholesale: 50,
    cost: 30,
    ageDays: 7,
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 14 },
      { size: 'L', stock: 11 },
      { size: 'XL', stock: 5 },
    ],
  },
  {
    name: 'Liverpool Home',
    team: 'Liverpool',
    kit: 'Home',
    brand: 'Nike',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#c8102e', sleeve: '#c8102e', accent: '#00b2a9' },
    number: 11,
    retail: 85,
    wholesale: 54,
    cost: 33,
    ageDays: 1,
    description: 'You’ll Never Walk Alone — 24/25 Anfield red.',
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 2 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 9 },
    ],
  },
  {
    name: 'Chelsea Home',
    team: 'Chelsea',
    kit: 'Home',
    brand: 'Nike',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#1f4ed8', sleeve: '#1f4ed8', accent: '#f4c430' },
    number: 10,
    retail: 80,
    wholesale: 50,
    cost: 31,
    ageDays: 9,
    sizes: [
      { size: 'S', stock: 7 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 3 },
    ],
  },
  {
    name: 'Tottenham Hotspur Home',
    team: 'Tottenham Hotspur',
    kit: 'Home',
    brand: 'Nike',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#ffffff', sleeve: '#ffffff', accent: '#131c4b' },
    number: 10,
    retail: 80,
    wholesale: 50,
    cost: 30,
    ageDays: 12,
    sizes: [
      { size: 'S', stock: 9 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 4 },
    ],
  },
  {
    name: 'Manchester United Home',
    team: 'Manchester United',
    kit: 'Home',
    brand: 'Adidas',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#da291c', sleeve: '#da291c', accent: '#1a1a1a' },
    number: 10,
    retail: 85,
    wholesale: 54,
    cost: 33,
    ageDays: 3,
    sizes: [
      { size: 'S', stock: 11 },
      { size: 'M', stock: 13 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 6 },
    ],
  },
  {
    name: 'Aston Villa Home',
    team: 'Aston Villa',
    kit: 'Home',
    brand: 'Adidas',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#670e36', sleeve: '#95bfe5', accent: '#95bfe5' },
    number: 7,
    retail: 75,
    wholesale: 47,
    cost: 29,
    ageDays: 16,
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 3 },
      { size: 'XL', stock: 1 },
    ],
  },
  {
    name: 'Arsenal Away',
    team: 'Arsenal',
    kit: 'Away',
    brand: 'Adidas',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#f7e017', sleeve: '#1a3a8f', accent: '#1a3a8f' },
    number: 7,
    retail: 85,
    wholesale: 54,
    cost: 33,
    ageDays: 14,
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 4 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 10 },
    ],
  },
  {
    name: 'Liverpool Goalkeeper',
    team: 'Liverpool',
    kit: 'Goalkeeper',
    brand: 'Nike',
    category: 'Premier League',
    pattern: 'solid',
    colors: { body: '#d6ff3f', sleeve: '#d6ff3f', accent: '#0b0b0b' },
    number: 1,
    retail: 70,
    wholesale: 44,
    cost: 27,
    status: 'Active',
    ageDays: 20,
    sizes: [
      { size: 'M', stock: 3 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 2 },
    ],
  },
  {
    name: 'Real Madrid Home',
    team: 'Real Madrid',
    kit: 'Home',
    brand: 'Adidas',
    category: 'La Liga',
    pattern: 'solid',
    colors: { body: '#ffffff', sleeve: '#ffffff', accent: '#d4af37' },
    number: 7,
    retail: 90,
    wholesale: 58,
    cost: 35,
    ageDays: 4,
    description: 'Los Blancos — pristine white with gold trim.',
    sizes: [
      { size: 'S', stock: 6 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 7 },
    ],
  },
  {
    name: 'FC Barcelona Home',
    team: 'FC Barcelona',
    kit: 'Home',
    brand: 'Nike',
    category: 'La Liga',
    pattern: 'stripes',
    colors: { body: '#004d98', sleeve: '#a50044', accent: '#a50044' },
    number: 19,
    retail: 90,
    wholesale: 58,
    cost: 35,
    ageDays: 6,
    description: 'Blaugrana stripes — Més que un club.',
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 4 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 3 },
    ],
  },
  {
    name: 'Paris Saint-Germain Home',
    team: 'Paris Saint-Germain',
    kit: 'Home',
    brand: 'Nike',
    category: 'Ligue 1',
    pattern: 'sash',
    colors: { body: '#0b1437', sleeve: '#0b1437', accent: '#da291c' },
    number: 10,
    retail: 88,
    wholesale: 56,
    cost: 34,
    ageDays: 10,
    description: 'Ici c’est Paris — navy with the famous red sash.',
    sizes: [
      { size: 'S', stock: 7 },
      { size: 'M', stock: 5 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 6 },
    ],
  },
  {
    name: 'Inter Milan Home',
    team: 'Inter Milan',
    kit: 'Home',
    brand: 'Nike',
    category: 'Serie A',
    pattern: 'stripes',
    colors: { body: '#1a47b8', sleeve: '#0a0a0a', accent: '#0a0a0a' },
    number: 10,
    retail: 85,
    wholesale: 54,
    cost: 33,
    status: 'Draft',
    ageDays: 22,
    sizes: [
      { size: 'M', stock: 6 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 4 },
    ],
  },
  {
    name: 'AC Milan Home',
    team: 'AC Milan',
    kit: 'Home',
    brand: 'Puma',
    category: 'Serie A',
    pattern: 'stripes',
    colors: { body: '#c8102e', sleeve: '#0b0b0b', accent: '#0b0b0b' },
    number: 9,
    retail: 85,
    wholesale: 54,
    cost: 33,
    ageDays: 18,
    sizes: [
      { size: 'S', stock: 4 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 9 },
      { size: 'XL', stock: 5 },
    ],
  },
  {
    name: 'Celtic Home',
    team: 'Celtic',
    kit: 'Home',
    brand: 'Adidas',
    category: 'Scottish Premiership',
    pattern: 'hoops',
    colors: { body: '#ffffff', sleeve: '#0e9e51', accent: '#0e9e51' },
    number: 8,
    retail: 75,
    wholesale: 47,
    cost: 29,
    ageDays: 24,
    description: 'The Bhoys — timeless green-and-white hoops.',
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 6 },
      { size: 'L', stock: 4 },
      { size: 'XL', stock: 3 },
    ],
  },
  {
    name: 'Brazil Home',
    team: 'Brazil',
    kit: 'Home',
    brand: 'Nike',
    category: 'International',
    pattern: 'solid',
    colors: { body: '#ffdf00', sleeve: '#ffdf00', accent: '#009739' },
    number: 10,
    retail: 80,
    wholesale: 50,
    cost: 30,
    ageDays: 8,
    description: 'Seleção canarinho — the most iconic yellow in football.',
    sizes: [
      { size: 'S', stock: 9 },
      { size: 'M', stock: 11 },
      { size: 'L', stock: 7 },
      { size: 'XL', stock: 4 },
    ],
  },
  {
    name: 'England Home',
    team: 'England',
    kit: 'Home',
    brand: 'Nike',
    category: 'International',
    pattern: 'solid',
    colors: { body: '#ffffff', sleeve: '#ffffff', accent: '#15235b' },
    number: 9,
    retail: 80,
    wholesale: 50,
    cost: 30,
    status: 'Inactive',
    ageDays: 30,
    sizes: [
      { size: 'S', stock: 0 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 1 },
    ],
  },
]

export function buildSeed(): { products: Product[]; seq: number } {
  const taken = new Set<string>()
  let seq = 1
  const now = Date.now()

  const products = DEFS.map((d, i) => {
    const variants: Variant[] = d.sizes.map((s) => {
      const { code, nextSeq } = makeCode(d.name, s.size, seq, taken)
      seq = nextSeq
      return { id: code, size: s.size, stock: s.stock }
    })

    return {
      uid: `seed-${String(i + 1).padStart(2, '0')}`,
      name: d.name,
      team: d.team,
      kit: d.kit,
      season: d.season ?? '24/25',
      brand: d.brand,
      category: d.category,
      channel: d.channel ?? 'Retail',
      colors: d.colors,
      pattern: d.pattern,
      number: d.number,
      retail: d.retail,
      wholesale: d.wholesale,
      cost: d.cost,
      status: d.status ?? 'Active',
      returnable: d.returnable ?? true,
      description: d.description,
      createdAt: now - (d.ageDays ?? i) * 86_400_000,
      variants,
    } satisfies Product
  })

  return { products, seq }
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const DAY = 86_400_000
let saleSeq = 0

/** A believable trailing week of sales so the app opens with a pulse. */
export function buildSeedSales(products: Product[]): Sale[] {
  const sellable = products.filter((p) => p.status === 'Active')
  const today0 = startOfToday()
  // sales per day, index 0 = today, going back a week
  const perDay = [9, 14, 11, 16, 8, 13, 10]
  const sales: Sale[] = []

  perDay.forEach((count, dayBack) => {
    const dayStart = today0 - dayBack * DAY
    for (let i = 0; i < count; i++) {
      const product = pick(sellable)
      const variant = pick(product.variants)
      const wholesale = Math.random() < 0.18
      // earlier in the day for older entries; today stops at "now"
      const span = dayBack === 0 ? Date.now() - today0 : DAY
      const ts = dayStart + Math.floor(Math.random() * span)
      const qty = Math.random() < 0.15 ? 2 : 1
      sales.push({
        id: `seed-sale-${(saleSeq += 1)}`,
        productUid: product.uid,
        productName: `${product.name} · ${variant.size}`,
        code: variant.id,
        size: variant.size,
        qty,
        price: wholesale ? product.wholesale : product.retail,
        channel: wholesale ? 'Wholesale' : 'Retail',
        ts,
      })
    }
  })

  return sales.sort((a, b) => b.ts - a.ts)
}
