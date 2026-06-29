import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Boxes, Coins, PiggyBank, Repeat, Trophy } from 'lucide-react'
import { Page } from '../components/Page'
import { StatCard } from '../components/StatCard'
import { CountUp } from '../components/CountUp'
import { AreaChart, type ChartPoint } from '../components/AreaChart'
import { Jersey } from '../components/Jersey'
import { useStore } from '../store/store'
import { salesByDay, topSellers, totalUnits, unitsFor } from '../store/selectors'
import { money } from '../lib/format'
import { cx } from '../lib/cx'

const KIT_COLORS: Record<string, string> = {
  Home: '#2bd46e',
  Away: '#57b0ff',
  Third: '#f6a623',
  Goalkeeper: '#a78bfa',
}

const CAT_PALETTE = ['#2bd46e', '#57b0ff', '#f6a623', '#a78bfa', '#f1543f', '#3ee884']

export function Reports() {
  const { products, sales } = useStore()

  const data = useMemo(() => {
    const active = products.filter((p) => p.status !== 'Inactive')
    const stockValue = active.reduce((s, p) => s + unitsFor(p) * p.retail, 0)
    const costValue = active.reduce((s, p) => s + unitsFor(p) * p.cost, 0)

    const byDay = salesByDay(sales, 7)
    const weekUnits = byDay.reduce((s, b) => s + b.units, 0)
    const stock = totalUnits(products)
    const sellThrough = weekUnits + stock > 0 ? (weekUnits / (weekUnits + stock)) * 100 : 0

    // kit mix by units
    const kitMap = new Map<string, number>()
    active.forEach((p) => kitMap.set(p.kit, (kitMap.get(p.kit) ?? 0) + unitsFor(p)))
    const kitMix = [...kitMap.entries()].map(([label, value]) => ({
      label,
      value,
      color: KIT_COLORS[label] ?? '#8c978f',
    }))

    // revenue by category from sales
    const index = new Map(products.map((p) => [p.uid, p]))
    const catMap = new Map<string, number>()
    sales.forEach((s) => {
      const p = index.get(s.productUid)
      if (!p) return
      catMap.set(p.category, (catMap.get(p.category) ?? 0) + s.qty * s.price)
    })
    const catRev = [...catMap.entries()]
      .map(([label, value], i) => ({ label, value, color: CAT_PALETTE[i % CAT_PALETTE.length] }))
      .sort((a, b) => b.value - a.value)

    const top = topSellers(sales, products, 6).sort((a, b) => b.revenue - a.revenue)

    return {
      stockValue,
      costValue,
      profit: stockValue - costValue,
      sellThrough,
      trend: byDay.map<ChartPoint>((b) => ({ label: b.label, value: Math.round(b.revenue), dow: b.dow })),
      weekRevenue: byDay.reduce((s, b) => s + b.revenue, 0),
      kitMix,
      catRev,
      top,
    }
  }, [products, sales])

  return (
    <Page>
      <div className="mb-7">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink md:text-[32px]">Reports</h1>
        <p className="mt-2 text-sm text-muted">Inventory valuation and how the rack is performing.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard index={0} tone="green" label="Stock value (retail)" icon={<Coins size={20} />} value={<CountUp value={data.stockValue} prefix="£" />} footer="if it all sells" />
        <StatCard index={1} tone="sky" label="Inventory cost" icon={<Boxes size={20} />} value={<CountUp value={data.costValue} prefix="£" />} footer="capital on the rack" />
        <StatCard index={2} tone="amber" label="Potential profit" icon={<PiggyBank size={20} />} value={<CountUp value={data.profit} prefix="£" />} footer="retail − cost" />
        <StatCard index={3} tone="violet" label="7-day sell-through" icon={<Repeat size={20} />} value={<CountUp value={data.sellThrough} decimals={1} suffix="%" />} footer="of available stock" />
      </div>

      {/* trend + kit mix */}
      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Revenue trend</h2>
              <p className="mt-0.5 text-[13px] text-muted">Last 7 days</p>
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-ink">{money(data.weekRevenue)}</div>
          </div>
          <AreaChart data={data.trend} color="var(--color-amber)" format={(n) => money(n)} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="card p-5">
          <h2 className="mb-4 text-base font-bold text-ink">Kit mix</h2>
          <div className="flex items-center gap-5">
            <Donut segments={data.kitMix} />
            <ul className="flex-1 space-y-2.5">
              {data.kitMix.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-[13px]">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-muted">{s.label}</span>
                  <span className="font-bold text-ink">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* category + top sellers */}
      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h2 className="mb-4 text-base font-bold text-ink">Revenue by category</h2>
          <Bars rows={data.catRev} format={(n) => money(n)} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber/12 text-amber"><Trophy size={16} /></span>
            <h2 className="text-base font-bold text-ink">Top sellers by revenue</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {data.top.map((row, i) => {
              const max = data.top[0]?.revenue || 1
              return (
                <li key={row.product.uid} className="flex items-center gap-3">
                  <span className="w-4 text-center text-sm font-extrabold text-dim">{i + 1}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-bg">
                    <Jersey colors={row.product.colors} pattern={row.product.pattern} showNumber={false} className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[13px] font-semibold text-ink">{row.product.name}</p>
                      <p className="ml-2 shrink-0 text-[13px] font-bold text-ink">{money(row.revenue)}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-amber transition-all duration-500" style={{ width: `${(row.revenue / max) * 100}%` }} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </Page>
  )
}

function Donut({ segments, size = 132, thickness = 20 }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0))
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={thickness} />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s) => {
          const frac = s.value / total
          const dash = frac * c
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, dash - 2)} ${c - Math.max(0, dash - 2)}`}
              strokeDashoffset={-acc}
            />
          )
          acc += dash
          return el
        })}
      </g>
      <text x="50%" y="48%" textAnchor="middle" className="tnum" fontSize="22" fontWeight="800" fill="var(--color-ink)">
        {total}
      </text>
      <text x="50%" y="62%" textAnchor="middle" fontSize="10" fill="var(--color-dim)">units</text>
    </svg>
  )
}

function Bars({ rows, format }: { rows: { label: string; value: number; color: string }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted">No sales yet.</p>
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="font-medium text-muted">{r.label}</span>
            <span className="font-bold text-ink">{format(r.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div className={cx('h-full rounded-full transition-all duration-500')} style={{ width: `${(r.value / max) * 100}%`, background: r.color }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
