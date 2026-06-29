import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Receipt,
  ScanLine,
  Search,
  TrendingUp,
  Undo2,
} from 'lucide-react'
import { Page } from '../components/Page'
import { Badge, Button, Segmented } from '../components/ui'
import { Jersey } from '../components/Jersey'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { revenueOf, unitsSold } from '../store/selectors'
import { clockTime, fullDate, money, startOfToday, startOfWeek } from '../lib/format'
import type { Sale } from '../lib/types'

type Range = 'today' | 'week' | 'all'

export function History() {
  const { sales, products, undoSale } = useStore()
  const { push } = useToast()
  const [range, setRange] = useState<Range>('week')
  const [q, setQ] = useState('')

  const jerseyFor = useMemo(() => {
    const m = new Map(products.map((p) => [p.uid, p]))
    return (uid: string) => m.get(uid)
  }, [products])

  const filtered = useMemo(() => {
    const from = range === 'today' ? startOfToday() : range === 'week' ? startOfWeek() : 0
    const needle = q.trim().toLowerCase()
    return sales
      .filter((s) => s.ts >= from)
      .filter((s) =>
        needle
          ? `${s.productName} ${s.code}`.toLowerCase().includes(needle)
          : true,
      )
  }, [sales, range, q])

  const revenue = revenueOf(filtered)
  const units = unitsSold(filtered)
  const avg = filtered.length ? revenue / filtered.length : 0

  // group by calendar day
  const groups = useMemo(() => {
    const map = new Map<string, Sale[]>()
    for (const s of filtered) {
      const key = new Date(s.ts).toDateString()
      const arr = map.get(key)
      arr ? arr.push(s) : map.set(key, [s])
    }
    const today = new Date().toDateString()
    const yest = new Date(Date.now() - 86_400_000).toDateString()
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: key === today ? 'Today' : key === yest ? 'Yesterday' : fullDate(items[0].ts),
      items,
      total: revenueOf(items),
    }))
  }, [filtered])

  const undo = (s: Sale) => {
    undoSale(s.id)
    push({ title: 'Sale reversed', description: `+1 ${s.productName}`, variant: 'info' })
  }

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink md:text-[32px]">
            Sales history
          </h1>
          <p className="mt-2 text-sm text-muted">Every tag you’ve sold, logged with a timestamp.</p>
        </div>
        <Link to="/scan">
          <Button variant="amber" icon={<ScanLine size={17} />}>Scan to sell</Button>
        </Link>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Summary icon={<TrendingUp size={18} />} tone="primary" label="Revenue" value={money(revenue)} />
        <Summary icon={<Receipt size={18} />} tone="sky" label="Orders" value={String(filtered.length)} sub={`${units} units`} />
        <Summary icon={<CalendarDays size={18} />} tone="amber" label="Avg. order" value={money(avg)} />
      </div>

      {/* controls */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Range>
          value={range}
          onChange={setRange}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This week' },
            { value: 'all', label: 'All time' },
          ]}
        />
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product or tag…"
            className="field h-10 w-56 pl-9"
          />
        </div>
      </div>

      {/* list */}
      <div className="mt-5 flex flex-col gap-5">
        {groups.length === 0 ? (
          <div className="card grid place-items-center py-20 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-dim">
              <Receipt size={26} />
            </span>
            <p className="mt-4 text-lg font-bold text-ink">No sales in this range</p>
            <p className="mt-1 text-sm text-muted">Try a wider range, or log a sale from the scanner.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.key}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-muted">{g.label}</h2>
                <span className="text-[13px] font-semibold text-dim">{money(g.total)}</span>
              </div>
              <div className="card divide-y divide-line overflow-hidden">
                {g.items.map((s) => {
                  const product = jerseyFor(s.productUid)
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group flex items-center gap-3.5 p-3 transition hover:bg-surface-2/40"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-bg">
                        {product ? (
                          <Jersey colors={product.colors} pattern={product.pattern} showNumber={false} className="size-8" />
                        ) : (
                          <Receipt size={18} className="text-dim" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink">{s.productName}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <code className="font-mono text-[11.5px] font-bold text-dim">{s.code}</code>
                          <Badge tone={s.channel === 'Wholesale' ? 'sky' : 'green'}>{s.channel}</Badge>
                        </div>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="tnum text-[13px] font-medium text-muted">{clockTime(s.ts)}</p>
                        <p className="text-[12px] text-dim">×{s.qty}</p>
                      </div>
                      <p className="tnum w-16 text-right text-[15px] font-bold text-ink">{money(s.price * s.qty)}</p>
                      <button
                        onClick={() => undo(s)}
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-dim opacity-100 transition hover:bg-surface-3 hover:text-ink sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Undo sale"
                      >
                        <Undo2 size={15} />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  )
}

function Summary({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  tone: 'primary' | 'sky' | 'amber'
}) {
  const chip =
    tone === 'primary' ? 'bg-primary/14 text-primary' : tone === 'sky' ? 'bg-sky/14 text-sky' : 'bg-amber/14 text-amber'
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${chip}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[12.5px] text-muted">{label}</p>
        <p className="truncate text-xl font-extrabold tracking-tight text-ink">
          {value}
          {sub && <span className="ml-1.5 text-[12px] font-medium text-dim">{sub}</span>}
        </p>
      </div>
    </div>
  )
}
