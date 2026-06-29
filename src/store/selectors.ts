import type { CodeMatch, Product, Sale } from '../lib/types'
import { LOW_STOCK_THRESHOLD } from './store'
import { startOfToday } from '../lib/format'

const DAY = 86_400_000

export const unitsFor = (p: Product): number =>
  p.variants.reduce((sum, v) => sum + v.stock, 0)

export function totalUnits(products: Product[]): number {
  return products
    .filter((p) => p.status === 'Active')
    .reduce((sum, p) => sum + unitsFor(p), 0)
}

export function activeCount(products: Product[]): number {
  return products.filter((p) => p.status === 'Active').length
}

/** in stock but below the threshold — the amber/red warnings */
export function lowStock(
  products: Product[],
  threshold = LOW_STOCK_THRESHOLD,
): CodeMatch[] {
  const out: CodeMatch[] = []
  for (const product of products) {
    if (product.status === 'Inactive') continue
    for (const variant of product.variants) {
      if (variant.stock > 0 && variant.stock < threshold)
        out.push({ product, variant })
    }
  }
  return out.sort((a, b) => a.variant.stock - b.variant.stock)
}

export function outOfStock(products: Product[]): CodeMatch[] {
  const out: CodeMatch[] = []
  for (const product of products) {
    if (product.status === 'Inactive') continue
    for (const variant of product.variants) {
      if (variant.stock === 0) out.push({ product, variant })
    }
  }
  return out
}

export const salesSince = (sales: Sale[], ts: number): Sale[] =>
  sales.filter((s) => s.ts >= ts)

export const unitsSold = (sales: Sale[]): number =>
  sales.reduce((sum, s) => sum + s.qty, 0)

export const revenueOf = (sales: Sale[]): number =>
  sales.reduce((sum, s) => sum + s.qty * s.price, 0)

export interface DayBucket {
  ts: number
  label: string
  dow: string
  units: number
  revenue: number
}

/** last `days` days, oldest → newest, for the dashboard sparkline */
export function salesByDay(sales: Sale[], days = 7): DayBucket[] {
  const today0 = startOfToday()
  const buckets: DayBucket[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ts = today0 - i * DAY
    const d = new Date(ts)
    buckets.push({
      ts,
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      dow: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3),
      units: 0,
      revenue: 0,
    })
  }
  for (const s of sales) {
    const idx = buckets.findIndex(
      (b) => s.ts >= b.ts && s.ts < b.ts + DAY,
    )
    if (idx >= 0) {
      buckets[idx].units += s.qty
      buckets[idx].revenue += s.qty * s.price
    }
  }
  return buckets
}

export interface SellerRow {
  product: Product
  units: number
  revenue: number
}

export function topSellers(
  sales: Sale[],
  products: Product[],
  n = 5,
): SellerRow[] {
  const byUid = new Map<string, SellerRow>()
  const index = new Map(products.map((p) => [p.uid, p]))
  for (const s of sales) {
    const product = index.get(s.productUid)
    if (!product) continue
    const row = byUid.get(s.productUid) ?? { product, units: 0, revenue: 0 }
    row.units += s.qty
    row.revenue += s.qty * s.price
    byUid.set(s.productUid, row)
  }
  return [...byUid.values()].sort((a, b) => b.units - a.units).slice(0, n)
}

export interface SplitRow {
  label: string
  units: number
}

export function categorySplit(products: Product[]): SplitRow[] {
  const map = new Map<string, number>()
  for (const p of products) {
    if (p.status === 'Inactive') continue
    map.set(p.category, (map.get(p.category) ?? 0) + unitsFor(p))
  }
  return [...map.entries()]
    .map(([label, units]) => ({ label, units }))
    .sort((a, b) => b.units - a.units)
}
