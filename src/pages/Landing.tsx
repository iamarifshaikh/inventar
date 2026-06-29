import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  Layers,
  PackageX,
  Palette,
  PlayCircle,
  QrCode,
  ScanLine,
  Sparkles,
  Tag,
  TrendingUp,
  WifiOff,
  Zap,
} from 'lucide-react'
import { LandingNav } from '../components/landing/LandingNav'
import { Footer } from '../components/landing/Footer'
import { Jersey } from '../components/Jersey'
import { Badge, Button } from '../components/ui'
import { StatCard } from '../components/StatCard'
import { CountUp } from '../components/CountUp'
import { AreaChart, type ChartPoint } from '../components/AreaChart'
import { ProductRow } from '../components/ProductRow'
import { useStore } from '../store/store'
import {
  lowStock,
  salesByDay,
  salesSince,
  revenueOf,
  totalUnits,
  unitsSold,
} from '../store/selectors'
import { money, startOfToday } from '../lib/format'
import type { Product } from '../lib/types'
import { cx } from '../lib/cx'

/* --------------------------- scroll reveal --------------------------- */
function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: ReactNode
  sub?: string
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-[30px] font-extrabold leading-[1.1] tracking-tight text-ink md:text-[42px]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-muted">{sub}</p>}
    </Reveal>
  )
}

/* ------------------------------- hero -------------------------------- */
function HeroVisual({ kits }: { kits: Product[] }) {
  const main = kits[0]
  const a = kits[1] ?? kits[0]
  const b = kits[2] ?? kits[0]
  if (!main) return null

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* glows */}
      <div className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[90px]" />
      <div className="absolute bottom-6 right-8 size-40 rounded-full bg-amber/20 blur-[70px]" />

      {/* orbit ring */}
      <div className="absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-line-strong/70" />

      {/* back jerseys */}
      <div className="absolute left-[6%] top-[16%] animate-drift opacity-50 blur-[1px]" style={{ animationDelay: '-2s' }}>
        <Jersey colors={a.colors} pattern={a.pattern} number={a.number} className="size-28" glow />
      </div>
      <div className="absolute bottom-[12%] right-[4%] animate-drift opacity-50 blur-[1px]" style={{ animationDelay: '-4s' }}>
        <Jersey colors={b.colors} pattern={b.pattern} number={b.number} className="size-24" glow />
      </div>

      {/* hero jersey */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-drift">
        <Jersey colors={main.colors} pattern={main.pattern} number={main.number} className="size-64 drop-shadow-2xl md:size-72" glow />
      </div>

      {/* scan-tag card */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -6 }}
        animate={{ opacity: 1, y: 0, rotate: -6 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="glass absolute left-[2%] top-[8%] w-[190px] rounded-2xl border border-line p-3 shadow-2xl"
      >
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-dim">
          <Tag size={12} /> Paper tag
        </div>
        <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/50 bg-bg px-3 py-2.5">
          <span className="absolute inset-x-2 top-3 h-0.5 rounded-full bg-primary shadow-[0_0_12px_2px_rgba(43,212,110,0.7)] animate-scanline" />
          <p className="font-mono text-2xl font-extrabold tracking-[0.14em] text-ink">AR-L-01</p>
        </div>
      </motion.div>

      {/* sold card */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 5 }}
        animate={{ opacity: 1, y: 0, rotate: 5 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="glass absolute bottom-[6%] left-[8%] flex w-[200px] items-center gap-3 rounded-2xl border border-line p-3 shadow-2xl"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Check size={20} strokeWidth={3} />
        </span>
        <div>
          <p className="text-[13px] font-bold text-ink">Sale logged</p>
          <p className="text-[11px] text-muted">Stock −1 · just now</p>
        </div>
      </motion.div>

      {/* stat chip */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass absolute right-[2%] top-[20%] rounded-2xl border border-line p-3.5 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-amber" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">Today</span>
        </div>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">£1,284</p>
        <p className="text-[11px] font-semibold text-primary">▲ 18% vs. yesterday</p>
      </motion.div>
    </div>
  )
}

function Hero({ kits }: { kits: Product[] }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-top opacity-60" />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 lg:grid-cols-2 lg:gap-6 lg:px-8">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12.5px] font-semibold text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Offline-first inventory · built for football
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-5 text-balance text-[40px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[52px] lg:text-[58px]">
              The kit room that runs at the speed of a{' '}
              <span className="bg-gradient-to-r from-primary to-primary-bright bg-clip-text text-transparent">
                scan
              </span>
              .
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted md:text-[17px]">
              Tag every shirt with a short code, then scan or type it to sell — stock
              updates instantly. No barcodes, no hardware, no internet. Just your phone
              and a handwritten tag.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                  Open the app
                </Button>
              </Link>
              <a href="#showcase">
                <Button variant="subtle" size="lg" icon={<PlayCircle size={18} />}>
                  See it in action
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {['No hardware', 'Works offline', 'Tags in under 3s'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted">
                  <Check size={15} className="text-primary" /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroVisual kits={kits} />
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------ marquee ------------------------------ */
function Marquee({ products }: { products: Product[] }) {
  const items = products.length ? [...products, ...products] : []
  return (
    <section className="relative border-y border-line py-8">
      <p className="mb-6 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-dim">
        Every kit, every league, every size
      </p>
      <div className="marquee-host mask-fade-x overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-10">
          {items.map((p, i) => (
            <div key={`${p.uid}-${i}`} className="flex shrink-0 items-center gap-2.5 opacity-80">
              <Jersey colors={p.colors} pattern={p.pattern} showNumber={false} className="size-9" />
              <span className="whitespace-nowrap text-sm font-semibold text-muted">{p.team}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- stats ------------------------------- */
function Stats() {
  const items = [
    { value: '< 3s', label: 'to write a tag' },
    { value: '0', label: 'internet needed' },
    { value: '£0', label: 'barcode hardware' },
    { value: '1 tap', label: 'to log a sale' },
  ]
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-14 lg:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="text-center">
            <div className="bg-gradient-to-b from-ink to-muted bg-clip-text text-[36px] font-extrabold tracking-tight text-transparent md:text-[44px]">
              {s.value}
            </div>
            <div className="mt-1 text-[13px] text-muted">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------- how it works --------------------------- */
function How() {
  const steps = [
    {
      n: '01',
      icon: Tag,
      tone: 'green' as const,
      title: 'Tag it',
      body: 'Add a kit and inventar mints a short code like BR-M-03 for every size. Scribble it on a paper tag and stick it on the shirt.',
      visual: (
        <div className="rounded-xl border-2 border-dashed border-primary/45 bg-bg px-3 py-2 text-center font-mono text-lg font-extrabold tracking-widest text-ink">
          BR-M-03
        </div>
      ),
    },
    {
      n: '02',
      icon: ScanLine,
      tone: 'amber' as const,
      title: 'Scan it',
      body: 'When it sells, point your camera at the tag — or just type it. The shirt is found in a heartbeat, online or off.',
      visual: (
        <div className="relative grid h-[52px] place-items-center overflow-hidden rounded-xl border border-line bg-bg">
          <span className="absolute inset-x-6 h-0.5 rounded-full bg-amber shadow-[0_0_12px_2px_rgba(246,166,35,0.7)] animate-scanline" />
          <ScanLine size={22} className="text-amber" />
        </div>
      ),
    },
    {
      n: '03',
      icon: Check,
      tone: 'sky' as const,
      title: 'Sold',
      body: 'Confirm, and stock drops by one — logged with a timestamp. Mis-tap? Undo in a second. It all just works offline.',
      visual: (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-bg py-2.5">
          <Check size={18} className="text-primary" strokeWidth={3} />
          <span className="text-sm font-bold text-ink">Stock −1</span>
          <Badge tone="green">logged</Badge>
        </div>
      ),
    },
  ]
  const chip = {
    green: 'bg-primary/14 text-primary',
    amber: 'bg-amber/14 text-amber',
    sky: 'bg-sky/14 text-sky',
  }
  return (
    <section id="how" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-20 lg:px-8">
      <SectionHead
        eyebrow="How it works"
        title="From shelf to sold in three moves"
        sub="The whole workflow is built around one handwritten tag. That’s the trick — and the entire learning curve."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="card group relative h-full p-6">
                <span className="absolute right-5 top-5 text-4xl font-extrabold text-surface-3">{s.n}</span>
                <span className={cx('grid size-12 place-items-center rounded-2xl', chip[s.tone])}>
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
                <div className="mt-5">{s.visual}</div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ----------------------------- features ------------------------------ */
function Features() {
  const cards = [
    {
      icon: QrCode,
      title: 'Auto-generated tags',
      body: 'Two letters, the size, a running number. Always unique, always under 8 characters, always writable in seconds.',
      visual: (
        <div className="flex flex-wrap gap-1.5">
          {['AR-L-01', 'BR-M-03', 'CE-S-08'].map((c) => (
            <span key={c} className="rounded-md border border-line bg-bg px-2 py-1 font-mono text-[12px] font-bold text-muted">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      icon: WifiOff,
      title: 'Truly offline',
      body: 'Everything runs on the device — scan, sell and restock with zero signal. Perfect for stalls, stadiums and basements.',
    },
    {
      icon: PackageX,
      title: 'Low-stock alerts',
      body: 'The moment a size dips below five, it surfaces in red on your dashboard so you never get caught short on a derby day.',
    },
    {
      icon: BarChart3,
      title: 'Reports & valuation',
      body: 'See stock value, potential profit, sell-through and your top sellers — the numbers an inventory manager actually reports on.',
      visual: (
        <div className="flex items-end gap-1.5">
          {[40, 70, 52, 88, 64, 100].map((h, i) => (
            <span key={i} className="w-3 rounded-t bg-primary/70" style={{ height: h * 0.42 }} />
          ))}
        </div>
      ),
    },
    {
      icon: Palette,
      title: 'Built-in kit designer',
      body: 'No photos to source. Design each shirt in team colours — solid, stripes, hoops, sash or halves — with a squad number.',
    },
    {
      icon: Layers,
      title: 'A tag per size',
      body: 'Track S, M, L and XL independently, each with its own code and stock count, all rolled up under one tidy product.',
      visual: (
        <div className="flex gap-1.5">
          {['S', 'M', 'L', 'XL'].map((s) => (
            <span key={s} className="grid size-8 place-items-center rounded-lg bg-surface-2 text-[12px] font-bold text-muted">
              {s}
            </span>
          ))}
        </div>
      ),
    },
  ]
  return (
    <section id="features" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-20 lg:px-8">
      <SectionHead
        eyebrow="Features"
        title={<>Everything a kit room needs.<br className="hidden md:block" /> Nothing it doesn’t.</>}
        sub="Purpose-built for selling football shirts fast — and knowing exactly what’s left."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <Reveal key={c.title} delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="card group relative h-full overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon size={21} />
                </span>
                <h3 className="relative mt-4 text-[17px] font-bold text-ink">{c.title}</h3>
                <p className="relative mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
                {c.visual && <div className="relative mt-4">{c.visual}</div>}
              </motion.div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ----------------------------- showcase ------------------------------ */
function Showcase() {
  const { products, sales } = useStore()
  const demo = products.filter((p) => p.status === 'Active').slice(0, 3)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(demo[0] ? [demo[0].uid] : []),
  )
  const toggle = (uid: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(uid) ? next.delete(uid) : next.add(uid)
      return next
    })

  const today = salesSince(sales, startOfToday())
  const chart = salesByDay(sales, 7).map<ChartPoint>((b) => ({
    label: b.label,
    value: b.units,
    dow: b.dow,
  }))
  const low = lowStock(products).length

  return (
    <section id="showcase" className="relative scroll-mt-24 overflow-hidden py-20">
      <div className="pointer-events-none absolute left-1/2 top-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
      <div className="relative mx-auto max-w-[1240px] px-4 lg:px-8">
        <SectionHead
          eyebrow="Live demo"
          title="Not a mockup. The real thing."
          sub="This is the actual app, running right here. Expand a row to copy a tag, nudge the stock, or sell one — it all works."
        />

        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-line bg-bg/60 px-4 py-3">
              <span className="size-3 rounded-full bg-danger/70" />
              <span className="size-3 rounded-full bg-amber/70" />
              <span className="size-3 rounded-full bg-primary/70" />
              <div className="mx-auto flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1 text-[12px] text-dim">
                <ScanLine size={12} className="text-primary" /> inventar.app/inventory
              </div>
            </div>

            {/* body */}
            <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-[1.05fr_1.35fr]">
              {/* left: stats + chart */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard tone="green" label="Units in stock" icon={<Layers size={18} />} value={<CountUp value={totalUnits(products)} />} />
                  <StatCard tone="amber" index={1} label="Sold today" icon={<Zap size={18} />} value={<CountUp value={unitsSold(today)} />} footer={money(revenueOf(today))} />
                </div>
                <div className="card p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-ink">Sales this week</h4>
                    <Badge tone={low > 0 ? 'amber' : 'green'}>{low} low-stock</Badge>
                  </div>
                  <AreaChart data={chart} height={150} />
                </div>
              </div>

              {/* right: live product rows */}
              <div className="flex flex-col gap-2.5">
                {demo.map((p) => (
                  <ProductRow key={p.uid} product={p} expanded={expanded.has(p.uid)} onToggle={() => toggle(p.uid)} />
                ))}
                <Link to="/inventory" className="mt-1">
                  <Button variant="subtle" block iconRight={<ArrowRight size={16} />}>
                    Open the full inventory
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ----------------------------- pricing ------------------------------- */
function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '£0',
      period: 'forever',
      desc: 'For a single stall finding its feet.',
      features: ['Up to 50 kits', 'Scan & manual sell', 'Low-stock alerts', 'Works fully offline'],
      cta: 'Start free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '£9',
      period: '/month',
      desc: 'For a growing shop that lives on its numbers.',
      features: ['Unlimited kits & sizes', 'Full sales history', 'Reports & valuation', 'Built-in kit designer', 'Priority cloud sync'],
      cta: 'Go Pro',
      highlight: true,
    },
    {
      name: 'Market',
      price: '£29',
      period: '/month',
      desc: 'For multi-stall traders and clubs.',
      features: ['Everything in Pro', 'Multiple locations', 'Team accounts', 'CSV & accounting export', 'Dedicated support'],
      cta: 'Contact sales',
      highlight: false,
    },
  ]
  return (
    <section id="pricing" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-20 lg:px-8">
      <SectionHead
        eyebrow="Pricing"
        title="Priced for the corner shop, not the boardroom"
        sub="Start free. Upgrade when the rack outgrows you. Cancel anytime."
      />
      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08} className="h-full">
            <div
              className={cx(
                'relative flex h-full flex-col rounded-3xl border p-6',
                t.highlight
                  ? 'border-primary/40 bg-gradient-to-b from-primary/[0.08] to-surface shadow-[0_0_0_1px_rgba(43,212,110,0.25),0_30px_80px_-30px_rgba(43,212,110,0.4)]'
                  : 'border-line bg-surface',
              )}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-primary-ink">
                  Most popular
                </span>
              )}
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">{t.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[40px] font-extrabold leading-none tracking-tight text-ink">{t.price}</span>
                <span className="mb-1 text-[13px] text-dim">{t.period}</span>
              </div>
              <p className="mt-2 text-[13.5px] text-muted">{t.desc}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-ink">
                    <span className={cx('grid size-5 shrink-0 place-items-center rounded-full', t.highlight ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-muted')}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className="mt-7">
                <Button variant={t.highlight ? 'primary' : 'subtle'} block iconRight={<ArrowRight size={16} />}>
                  {t.cta}
                </Button>
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------- CTA --------------------------------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-16 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-primary/25 px-6 py-16 text-center md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.12] to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[110px]" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles size={13} /> Ready in an afternoon
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-[32px] font-extrabold leading-tight tracking-tight text-ink md:text-[46px]">
              Your kit room, sorted by kick-off.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted">
              Spin up the demo catalogue, scan your first tag, and watch the stock move.
              No sign-up, no setup, no internet required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                  Open the app
                </Button>
              </Link>
              <Link to="/scan">
                <Button variant="amber" size="lg" icon={<ScanLine size={18} />}>
                  Try scan to sell
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Landing ------------------------------ */
export function Landing() {
  const { products } = useStore()
  const find = (name: string) => products.find((p) => p.name === name)
  const heroKits = [
    find('Brazil Home'),
    find('Newcastle United Home'),
    find('Arsenal Home'),
  ].filter(Boolean) as Product[]
  const kits = heroKits.length ? heroKits : products.slice(0, 3)
  const marquee = products.filter((p) => p.status !== 'Inactive').slice(0, 10)

  return (
    <div id="top" className="relative min-h-screen overflow-clip">
      <LandingNav />
      <Hero kits={kits} />
      <Marquee products={marquee} />
      <Stats />
      <How />
      <Features />
      <Showcase />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
