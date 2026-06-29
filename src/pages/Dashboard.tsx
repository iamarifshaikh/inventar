import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Boxes,
  Flame,
  PackageX,
  Plus,
  ScanLine,
  TrendingUp,
  Trophy,
  WifiOff,
} from 'lucide-react'
import { Page } from '../components/Page'
import { StatCard } from '../components/StatCard'
import { CountUp } from '../components/CountUp'
import { AreaChart, type ChartPoint } from '../components/AreaChart'
import { Jersey } from '../components/Jersey'
import { Badge, Button, StockBar, stockTone } from '../components/ui'
import { useStore } from '../store/store'
import {
  activeCount,
  lowStock,
  outOfStock,
  revenueOf,
  salesByDay,
  salesSince,
  topSellers,
  totalUnits,
  unitsSold,
} from '../store/selectors'
import { money, startOfToday, clockTime } from '../lib/format'
import { useToast } from '../components/Toast'

const DAY = 86_400_000

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const { products, sales, adjustStock } = useStore()
  const { push } = useToast()

  const stats = useMemo(() => {
    const today0 = startOfToday()
    const today = salesSince(sales, today0)
    const yest = sales.filter((s) => s.ts >= today0 - DAY && s.ts < today0)
    const byDay = salesByDay(sales, 7)
    return {
      inStock: totalUnits(products),
      styles: activeCount(products),
      todayUnits: unitsSold(today),
      todayRevenue: revenueOf(today),
      yestUnits: unitsSold(yest),
      low: lowStock(products),
      out: outOfStock(products),
      chart: byDay.map<ChartPoint>((b) => ({
        label: b.label,
        value: b.units,
        dow: b.dow,
      })),
      weekUnits: byDay.reduce((s, b) => s + b.units, 0),
      weekRevenue: byDay.reduce((s, b) => s + b.revenue, 0),
      top: topSellers(sales, products, 5),
    }
  }, [products, sales])

  const delta =
    stats.yestUnits > 0
      ? Math.round(((stats.todayUnits - stats.yestUnits) / stats.yestUnits) * 100)
      : null

  const attention = [...stats.out, ...stats.low].slice(0, 5)
  const recent = sales.slice(0, 4)

  return (
    <Page>
      {/* greeting */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
            <Badge tone="green" icon={<WifiOff size={11} />}>Works offline</Badge>
          </div>
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink md:text-[34px]">
            {greeting()}, Kit Room
          </h1>
          <p className="mt-2 text-sm text-muted">
            Here’s how the rack is moving today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/add">
            <Button variant="subtle" icon={<Plus size={17} />}>
              Add product
            </Button>
          </Link>
          <Link to="/scan" className="hidden sm:block">
            <Button variant="amber" icon={<ScanLine size={17} />}>
              Scan to sell
            </Button>
          </Link>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          index={0}
          tone="green"
          label="Units in stock"
          icon={<Boxes size={20} />}
          value={<CountUp value={stats.inStock} />}
          footer={`across ${stats.styles} active styles`}
        />
        <StatCard
          index={1}
          tone="sky"
          label="Sold today"
          icon={<Flame size={20} />}
          value={<CountUp value={stats.todayUnits} />}
          delta={delta != null ? { value: `${Math.abs(delta)}%`, up: delta >= 0 } : undefined}
          footer="vs. yesterday"
        />
        <StatCard
          index={2}
          tone="amber"
          label="Revenue today"
          icon={<TrendingUp size={20} />}
          value={<CountUp value={stats.todayRevenue} prefix="£" />}
          footer={`${stats.weekUnits} units this week`}
        />
        <StatCard
          index={3}
          tone="red"
          label="Need attention"
          icon={<PackageX size={20} />}
          value={<CountUp value={stats.low.length + stats.out.length} />}
          footer={`${stats.out.length} out · ${stats.low.length} low`}
        />
      </div>

      {/* trend + scan CTA */}
      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="mb-1 flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Sales this week</h2>
              <p className="mt-0.5 text-[13px] text-muted">Units sold, last 7 days</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold tracking-tight text-ink">
                {money(stats.weekRevenue)}
              </div>
              <div className="text-[12px] text-dim">{stats.weekUnits} units</div>
            </div>
          </div>
          <AreaChart data={stats.chart} />
        </motion.div>

        {/* scan to sell — the hero action */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Link
            to="/scan"
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 text-amber-ink"
            style={{
              background:
                'linear-gradient(155deg, var(--color-amber-bright) 0%, var(--color-amber) 45%, var(--color-amber-deep) 100%)',
              boxShadow: '0 22px 60px -20px rgba(246,166,35,0.6)',
            }}
          >
            <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="relative grid size-14 place-items-center rounded-2xl bg-black/15">
                <span className="absolute inset-0 rounded-2xl bg-black/10" style={{ animation: 'pulse-ring 2.4s ease-out infinite' }} />
                <ScanLine size={28} strokeWidth={2.4} />
              </span>
              <ArrowRight size={22} className="transition-transform duration-200 group-hover:translate-x-1" />
            </div>
            <div className="relative mt-8">
              <h2 className="text-[26px] font-extrabold leading-tight">Scan to sell</h2>
              <p className="mt-1.5 text-[13.5px] font-medium text-amber-ink/75">
                Point at the tag, confirm, done. Stock drops by one — instantly, even offline.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black/15 px-4 py-2.5 text-sm font-bold backdrop-blur-sm transition group-hover:bg-black/25">
                Open scanner <ScanLine size={16} />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* attention + top sellers */}
      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-3">
        {/* needs attention */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-danger/12 text-danger">
                <PackageX size={17} />
              </span>
              <h2 className="text-base font-bold text-ink">Needs attention</h2>
            </div>
            <Link to="/inventory" className="text-[13px] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          {attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Everything’s well stocked. Nice. 👌
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {attention.map(({ product, variant }) => (
                <li key={variant.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-bg">
                    <Jersey colors={product.colors} pattern={product.pattern} showNumber={false} className="size-8" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {product.name} · {variant.size}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted">
                        {variant.id}
                      </code>
                      <Badge tone={stockTone(variant.stock)}>
                        {variant.stock === 0 ? 'Out of stock' : `${variant.stock} left`}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="subtle"
                    icon={<Plus size={15} />}
                    onClick={() => {
                      adjustStock(product.uid, variant.id, 10)
                      push({
                        title: 'Restocked +10',
                        description: `${product.name} · ${variant.size} (${variant.id})`,
                        variant: 'success',
                      })
                    }}
                  >
                    Restock
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* top sellers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          className="card p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-amber/12 text-amber">
              <Trophy size={17} />
            </span>
            <h2 className="text-base font-bold text-ink">Top sellers</h2>
          </div>
          <ul className="flex flex-col gap-3.5">
            {stats.top.map((row, i) => {
              const max = stats.top[0]?.units || 1
              return (
                <li key={row.product.uid} className="flex items-center gap-3">
                  <span className="w-4 text-center text-sm font-extrabold text-dim">{i + 1}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-bg">
                    <Jersey colors={row.product.colors} pattern={row.product.pattern} showNumber={false} className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{row.product.name}</p>
                    <StockBar stock={row.units} cap={max} className="mt-1.5" />
                  </div>
                  <span className="tnum text-[13px] font-bold text-ink">{row.units}</span>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-dim">Latest sales</p>
            <ul className="flex flex-col gap-2">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-[13px]">
                  <span className="truncate pr-2 text-muted">{s.productName}</span>
                  <span className="tnum shrink-0 text-dim">{clockTime(s.ts)}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </Page>
  )
}
