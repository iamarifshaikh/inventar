import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react'
import { Page } from '../components/Page'
import { Button, Chip } from '../components/ui'
import { Select } from '../components/Select'
import { ProductRow, stockSummary } from '../components/ProductRow'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../store/store'
import { unitsFor } from '../store/selectors'
import type { ProductStatus } from '../lib/types'
import { cx } from '../lib/cx'

type StatusFilter = 'All' | ProductStatus
type ChannelFilter = 'All' | 'Retail' | 'Wholesale'
type StockFilter = 'all' | 'in' | 'low' | 'out'
type SortKey = 'newest' | 'az' | 'za' | 'stock-desc' | 'stock-asc' | 'price-desc'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'az', label: 'Alphabetical · A–Z' },
  { value: 'za', label: 'Alphabetical · Z–A' },
  { value: 'stock-desc', label: 'Stock · high to low' },
  { value: 'stock-asc', label: 'Stock · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
]

function AddProductButton() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const kits: { label: string; desc: string; kit: string }[] = [
    { label: 'Home kit', desc: 'The primary matchday shirt', kit: 'Home' },
    { label: 'Away kit', desc: 'Travelling colours', kit: 'Away' },
    { label: 'Third kit', desc: 'Alternate / special edition', kit: 'Third' },
    { label: 'Goalkeeper', desc: 'Keeper jersey', kit: 'Goalkeeper' },
  ]

  return (
    <div ref={ref} className="relative">
      <div className="flex">
        <Link to="/add">
          <Button variant="primary" icon={<Plus size={17} />} className="rounded-r-none">
            Add product
          </Button>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-9 place-items-center rounded-r-xl bg-primary-deep text-primary-ink transition hover:bg-primary"
          aria-label="Add product type"
        >
          <ChevronDown size={16} className={cx('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-12 z-50 w-72 rounded-2xl border border-line p-2 shadow-2xl"
          >
            {kits.map((k) => (
              <button
                key={k.kit}
                onClick={() => {
                  setOpen(false)
                  navigate(`/add?kit=${k.kit}`)
                }}
                className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-surface-2"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-[12px] font-extrabold text-primary">
                  {k.kit.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{k.label}</p>
                  <p className="text-[12px] text-muted">{k.desc}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Inventory() {
  const { products } = useStore()

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<StatusFilter>('All')
  const [channel, setChannel] = useState<ChannelFilter>('All')
  const [stock, setStock] = useState<StockFilter>('all')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  )

  const statusCounts = useMemo(() => {
    const c = { All: products.length, Active: 0, Inactive: 0, Draft: 0 }
    products.forEach((p) => (c[p.status] += 1))
    return c
  }, [products])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const min = priceMin ? Number(priceMin) : -Infinity
    const max = priceMax ? Number(priceMax) : Infinity

    let list = products.filter((p) => {
      if (status !== 'All' && p.status !== status) return false
      if (channel !== 'All' && p.channel !== channel) return false
      if (category !== 'all' && p.category !== category) return false
      if (p.retail < min || p.retail > max) return false

      const { units, hasOut, hasLow } = stockSummary(p)
      if (stock === 'in' && units <= 0) return false
      if (stock === 'low' && !hasLow) return false
      if (stock === 'out' && !hasOut) return false

      if (needle) {
        const hay = `${p.name} ${p.team} ${p.brand} ${p.category} ${p.kit} ${p.variants
          .map((v) => v.id)
          .join(' ')}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'az':
          return a.name.localeCompare(b.name)
        case 'za':
          return b.name.localeCompare(a.name)
        case 'stock-desc':
          return unitsFor(b) - unitsFor(a)
        case 'stock-asc':
          return unitsFor(a) - unitsFor(b)
        case 'price-desc':
          return b.retail - a.retail
        default:
          return b.createdAt - a.createdAt
      }
    })
    return list
  }, [products, q, status, channel, category, stock, sort, priceMin, priceMax])

  const totalUnits = useMemo(
    () => filtered.reduce((s, p) => s + unitsFor(p), 0),
    [filtered],
  )

  const toggle = (uid: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(uid) ? next.delete(uid) : next.add(uid)
      return next
    })

  const openDetail = (uid: string) => {
    setView('list')
    setExpanded((prev) => new Set(prev).add(uid))
    setTimeout(() => {
      document.getElementById(`row-${uid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  const dirty =
    q || status !== 'All' || channel !== 'All' || stock !== 'all' || category !== 'all' || priceMin || priceMax
  const reset = () => {
    setQ('')
    setStatus('All')
    setChannel('All')
    setStock('all')
    setCategory('all')
    setPriceMin('')
    setPriceMax('')
    setSort('newest')
  }

  return (
    <Page>
      {/* header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-ink md:text-[32px]">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-ink">{filtered.length}</span> of {products.length} styles
            <span className="mx-1.5 text-dim">·</span>
            <span className="font-semibold text-ink">{totalUnits.toLocaleString('en-GB')}</span> units in view
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5 sm:w-auto sm:justify-end">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search team, brand or tag…"
              className="field h-11 w-full pl-9 sm:w-64"
            />
          </div>
          <div className="hidden items-center gap-1 rounded-xl border border-line bg-bg p-1 sm:flex">
            {([['list', List], ['grid', LayoutGrid]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cx(
                  'grid size-9 place-items-center rounded-lg transition',
                  view === v ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink',
                )}
                aria-label={`${v} view`}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
          <AddProductButton />
        </div>
      </div>

      {/* mobile filter toggle */}
      <button
        onClick={() => setShowFilters((v) => !v)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-ink transition hover:border-line-strong lg:hidden"
      >
        <SlidersHorizontal size={16} className="text-primary" />
        {showFilters ? 'Hide filters' : 'Filters'}
        {dirty && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary">on</span>}
      </button>

      <div className="grid gap-6 lg:grid-cols-[256px_1fr]">
        {/* ------------------------- filter rail ------------------------- */}
        <aside
          className={cx(
            'card h-fit self-start p-4 lg:sticky lg:top-[84px] lg:block',
            showFilters ? 'block' : 'hidden',
          )}
        >
          <div className="mb-4 hidden items-center gap-2 text-sm font-bold text-ink lg:flex">
            <SlidersHorizontal size={16} className="text-primary" /> Filters
          </div>

          <FilterSection label="Product status">
            <div className="grid grid-cols-2 gap-1.5">
              {(['All', 'Active', 'Inactive', 'Draft'] as StatusFilter[]).map((s) => (
                <Chip key={s} active={status === s} onClick={() => setStatus(s)} className="justify-between">
                  <span>{s}</span>
                  <span className="tnum text-[11px] opacity-60">{statusCounts[s]}</span>
                </Chip>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Channel">
            <div className="grid grid-cols-3 gap-1.5">
              {(['All', 'Retail', 'Wholesale'] as ChannelFilter[]).map((c) => (
                <Chip key={c} active={channel === c} onClick={() => setChannel(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Sort by">
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </FilterSection>

          <FilterSection label="Stock alert">
            <Select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)}>
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </Select>
          </FilterSection>

          <FilterSection label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FilterSection>

          <FilterSection label="Price (£)">
            <div className="flex items-center gap-2">
              <input
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                inputMode="numeric"
                placeholder="Min"
                className="field h-10"
              />
              <span className="text-dim">–</span>
              <input
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                inputMode="numeric"
                placeholder="Max"
                className="field h-10"
              />
            </div>
          </FilterSection>

          <button
            onClick={reset}
            disabled={!dirty}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-[13px] font-semibold text-muted transition hover:border-line-strong hover:text-ink disabled:opacity-40"
          >
            <RotateCcw size={14} /> Reset filters
          </button>
        </aside>

        {/* --------------------------- results --------------------------- */}
        <section>
          {filtered.length === 0 ? (
            <div className="card grid place-items-center py-20 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-dim">
                <SearchX size={26} />
              </span>
              <p className="mt-4 text-lg font-bold text-ink">No kits match</p>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Try loosening your filters or searching a different team.
              </p>
              {dirty && (
                <Button variant="subtle" className="mt-5" icon={<RotateCcw size={15} />} onClick={reset}>
                  Reset filters
                </Button>
              )}
            </div>
          ) : view === 'list' ? (
            <motion.div layout className="flex flex-col gap-2.5">
              {filtered.map((p) => (
                <div key={p.uid} id={`row-${p.uid}`}>
                  <ProductRow product={p} expanded={expanded.has(p.uid)} onToggle={() => toggle(p.uid)} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.uid} product={p} onOpen={() => openDetail(p.uid)} />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </Page>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-dim">{label}</p>
      {children}
    </div>
  )
}
