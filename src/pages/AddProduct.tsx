import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  FileText,
  Layers,
  PoundSterling,
  QrCode,
  Save,
  Shirt,
  Sparkles,
} from 'lucide-react'
import { Page } from '../components/Page'
import { Button } from '../components/ui'
import { Select } from '../components/Select'
import { Jersey } from '../components/Jersey'
import { useStore, type NewProductInput } from '../store/store'
import { useToast } from '../components/Toast'
import type { Channel, JerseyColors, KitType, Pattern, ProductStatus } from '../lib/types'
import { money, toInt } from '../lib/format'
import { cx } from '../lib/cx'

const STEPS = [
  { key: 'general', label: 'General Information', icon: FileText },
  { key: 'pricing', label: 'Sales Information', icon: PoundSterling },
  { key: 'stock', label: 'Stock & Sizes', icon: Layers },
  { key: 'tags', label: 'Tags & Review', icon: QrCode },
] as const

const PATTERNS: { key: Pattern; label: string }[] = [
  { key: 'solid', label: 'Solid' },
  { key: 'stripes', label: 'Stripes' },
  { key: 'hoops', label: 'Hoops' },
  { key: 'sash', label: 'Sash' },
  { key: 'halves', label: 'Halves' },
]

const PALETTES: { name: string; colors: JerseyColors; pattern: Pattern }[] = [
  { name: 'Gunners', colors: { body: '#e2231a', sleeve: '#ffffff', accent: '#001f4e' }, pattern: 'solid' },
  { name: 'Magpies', colors: { body: '#f4f4f4', sleeve: '#0b0b0b', accent: '#0b0b0b' }, pattern: 'stripes' },
  { name: 'Sky blue', colors: { body: '#6cabdd', sleeve: '#6cabdd', accent: '#1c2c5b' }, pattern: 'solid' },
  { name: 'Bhoys', colors: { body: '#ffffff', sleeve: '#0e9e51', accent: '#0e9e51' }, pattern: 'hoops' },
  { name: 'Les Parisiens', colors: { body: '#0b1437', sleeve: '#0b1437', accent: '#da291c' }, pattern: 'sash' },
  { name: 'Canarinho', colors: { body: '#ffdf00', sleeve: '#ffdf00', accent: '#009739' }, pattern: 'solid' },
]

const BRANDS = ['Adidas', 'Nike', 'Puma', 'New Balance', 'Castore', 'Umbro', 'Other']
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-left"
    >
      <span
        className={cx(
          'grid size-5 place-items-center rounded-md border transition',
          checked ? 'border-primary bg-primary text-primary-ink' : 'border-line-strong bg-bg',
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span>
        <span className="text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="ml-1.5 text-[12px] text-dim">{hint}</span>}
      </span>
    </button>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
        {label}
        {hint && <span className="font-normal text-dim">· {hint}</span>}
      </span>
      {children}
    </label>
  )
}

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-bg p-2">
      <span
        className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-line-strong"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-ink">{label}</p>
        <p className="font-mono text-[11px] uppercase text-dim">{value}</p>
      </div>
    </div>
  )
}

export function AddProduct() {
  const navigate = useNavigate()
  const { addProduct, previewCodes } = useStore()
  const { push } = useToast()
  const [params] = useSearchParams()

  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(0)

  // form state
  const [name, setName] = useState('')
  const [kit, setKit] = useState<KitType>((params.get('kit') as KitType) || 'Home')
  const [season, setSeason] = useState('24/25')
  const [brand, setBrand] = useState('Adidas')
  const [category, setCategory] = useState('Premier League')
  const [channel, setChannel] = useState<Channel>('Retail')
  const [returnable, setReturnable] = useState(true)
  const [hasVariant, setHasVariant] = useState(true)
  const [pattern, setPattern] = useState<Pattern>('solid')
  const [colors, setColors] = useState<JerseyColors>({
    body: '#2bd46e',
    sleeve: '#0e9e51',
    accent: '#04130a',
  })
  const [squadNo, setSquadNo] = useState('10')
  const [description, setDescription] = useState('')

  const [retail, setRetail] = useState('')
  const [wholesale, setWholesale] = useState('')
  const [cost, setCost] = useState('')

  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([
    { size: 'S', stock: 6 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 8 },
    { size: 'XL', stock: 4 },
  ])
  const [single, setSingle] = useState(12)

  const variantList = useMemo(
    () => (hasVariant ? sizes : [{ size: 'OS', stock: single }]),
    [hasVariant, sizes, single],
  )

  const codes = useMemo(
    () => previewCodes(name || 'New Kit', variantList.map((v) => v.size)),
    [previewCodes, name, variantList],
  )

  const r = toInt(retail)
  const w = toInt(wholesale)
  const c = toInt(cost)
  const retailMargin = r > 0 ? Math.round(((r - c) / r) * 100) : 0
  const wholesaleMargin = w > 0 ? Math.round(((w - c) / w) * 100) : 0
  const totalUnits = variantList.reduce((s, v) => s + v.stock, 0)

  const stepValid = [
    name.trim().length > 1,
    r > 0,
    variantList.length > 0,
    true,
  ]
  const canNext = stepValid[step]

  const go = (i: number) => {
    setStep(i)
    setReached((m) => Math.max(m, i))
  }
  const next = () => canNext && go(Math.min(STEPS.length - 1, step + 1))
  const prev = () => go(Math.max(0, step - 1))

  const build = (status: ProductStatus): NewProductInput => ({
    name: name.trim(),
    team: name.trim(),
    kit,
    season,
    brand,
    category: category.trim() || 'Uncategorised',
    channel,
    colors,
    pattern,
    number: squadNo ? toInt(squadNo) : undefined,
    retail: r,
    wholesale: w,
    cost: c,
    status,
    returnable,
    description: description.trim() || undefined,
    variants: variantList,
  })

  const save = (status: ProductStatus) => {
    const product = addProduct(build(status))
    push({
      title: status === 'Draft' ? 'Saved as draft' : 'Product added',
      description: `${product.name} · ${product.variants.length} tags generated`,
      variant: 'success',
    })
    navigate('/inventory')
  }

  const copyCode = (code: string) =>
    navigator.clipboard?.writeText(code).then(() =>
      push({ title: `Copied ${code}`, variant: 'success' }),
    )

  return (
    <Page>
      {/* top bar */}
      <div className="mb-6">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition hover:text-ink"
        >
          <ChevronLeft size={16} /> Back to inventory
        </Link>
        <div className="mt-3 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-dim">Add new product</p>
          <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-ink md:text-[30px]">
            {STEPS[step].label}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* stepper */}
        <aside className="card h-fit self-start p-3 lg:sticky lg:top-[84px]">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = i < step
            const active = i === step
            const clickable = i <= reached
            return (
              <button
                key={s.key}
                disabled={!clickable}
                onClick={() => clickable && setStep(i)}
                className={cx(
                  'relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition',
                  active && 'bg-primary/10',
                  clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="step-bar"
                    className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  />
                )}
                <span
                  className={cx(
                    'grid size-9 shrink-0 place-items-center rounded-xl border transition',
                    done
                      ? 'border-primary bg-primary text-primary-ink'
                      : active
                        ? 'border-primary/40 bg-primary/15 text-primary'
                        : 'border-line bg-bg text-dim',
                  )}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-dim">
                    Step {i + 1}
                  </p>
                  <p className={cx('truncate text-[13.5px] font-semibold', active || done ? 'text-ink' : 'text-muted')}>
                    {s.label}
                  </p>
                </div>
              </button>
            )
          })}
        </aside>

        {/* form panel */}
        <div className="card min-h-[440px] p-5 md:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="grid gap-5">
                    <div className="flex flex-wrap gap-6">
                      <Checkbox checked={returnable} onChange={setReturnable} label="Returnable product" />
                      <Checkbox checked={hasVariant} onChange={setHasVariant} label="Has size variants" />
                    </div>

                    <Field label="Product name" hint="e.g. Arsenal Home">
                      <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Team + kit, e.g. Liverpool Home"
                        className="field"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Kit type">
                        <Select value={kit} onChange={(e) => setKit(e.target.value as KitType)}>
                          <option>Home</option>
                          <option>Away</option>
                          <option>Third</option>
                          <option>Goalkeeper</option>
                        </Select>
                      </Field>
                      <Field label="Brand">
                        <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                          {BRANDS.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Category">
                        <input
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          list="cat-list"
                          className="field"
                        />
                        <datalist id="cat-list">
                          <option value="Premier League" />
                          <option value="La Liga" />
                          <option value="Serie A" />
                          <option value="Ligue 1" />
                          <option value="International" />
                          <option value="Scottish Premiership" />
                        </datalist>
                      </Field>
                      <Field label="Season">
                        <input value={season} onChange={(e) => setSeason(e.target.value)} className="field" />
                      </Field>
                    </div>

                    <Field label="Description" hint="optional">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="A short note about the shirt…"
                        className="field resize-none"
                      />
                    </Field>
                  </div>

                  {/* jersey designer */}
                  <div className="rounded-2xl border border-line bg-bg/50 p-4">
                    <div className="mb-3 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-primary">
                      <Sparkles size={13} /> Kit designer
                    </div>
                    <div
                      className="grid h-40 place-items-center rounded-xl border border-line"
                      style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.05), var(--color-bg))' }}
                    >
                      <Jersey
                        colors={colors}
                        pattern={pattern}
                        number={squadNo ? toInt(squadNo) : undefined}
                        glow
                        className="size-32"
                      />
                    </div>

                    <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-dim">Pattern</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PATTERNS.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => setPattern(p.key)}
                          className={cx(
                            'rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition',
                            pattern === p.key
                              ? 'border-primary/50 bg-primary/12 text-primary'
                              : 'border-line text-muted hover:text-ink',
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <Swatch label="Body" value={colors.body} onChange={(v) => setColors({ ...colors, body: v })} />
                      <Swatch label="Sleeves" value={colors.sleeve} onChange={(v) => setColors({ ...colors, sleeve: v })} />
                      <Swatch label="Accent" value={colors.accent} onChange={(v) => setColors({ ...colors, accent: v })} />
                    </div>

                    <p className="mb-2 mt-3 text-[11px] font-bold uppercase tracking-wide text-dim">Presets</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PALETTES.map((pal) => (
                        <button
                          key={pal.name}
                          title={pal.name}
                          onClick={() => {
                            setColors(pal.colors)
                            setPattern(pal.pattern)
                          }}
                          className="size-7 rounded-lg border border-line-strong transition hover:scale-110"
                          style={{
                            background: `linear-gradient(135deg, ${pal.colors.body} 50%, ${pal.colors.accent} 50%)`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="mt-3">
                      <Field label="Squad number" hint="shown on the shirt">
                        <input
                          value={squadNo}
                          onChange={(e) => setSquadNo(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          inputMode="numeric"
                          className="field h-10"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="mx-auto max-w-2xl">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Retail price">
                      <div className="relative">
                        <PoundSterling size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                        <input value={retail} onChange={(e) => setRetail(e.target.value)} inputMode="numeric" placeholder="0" className="field pl-8" />
                      </div>
                    </Field>
                    <Field label="Wholesale price">
                      <div className="relative">
                        <PoundSterling size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                        <input value={wholesale} onChange={(e) => setWholesale(e.target.value)} inputMode="numeric" placeholder="0" className="field pl-8" />
                      </div>
                    </Field>
                    <Field label="Unit cost">
                      <div className="relative">
                        <PoundSterling size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                        <input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="numeric" placeholder="0" className="field pl-8" />
                      </div>
                    </Field>
                  </div>

                  <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                    <MarginCard title="Retail margin & profit" margin={retailMargin} profit={r - c} />
                    <MarginCard title="Wholesale margin & profit" margin={wholesaleMargin} profit={w - c} />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-[12.5px] font-semibold text-muted">Primary sales channel</p>
                    <div className="inline-flex rounded-xl border border-line bg-bg p-1">
                      {(['Retail', 'Wholesale'] as Channel[]).map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setChannel(ch)}
                          className={cx(
                            'rounded-lg px-5 py-2 text-sm font-semibold transition',
                            channel === ch ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink',
                          )}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mx-auto max-w-2xl">
                  {hasVariant ? (
                    <>
                      <Field label="Sizes in this kit">
                        <div className="flex flex-wrap gap-1.5">
                          {SIZE_PRESETS.map((sz) => {
                            const on = sizes.some((s) => s.size === sz)
                            return (
                              <button
                                key={sz}
                                onClick={() =>
                                  setSizes((prev) =>
                                    on ? prev.filter((s) => s.size !== sz) : [...prev, { size: sz, stock: 0 }],
                                  )
                                }
                                className={cx(
                                  'h-10 min-w-[44px] rounded-xl border px-3 text-sm font-bold transition',
                                  on
                                    ? 'border-primary/50 bg-primary/12 text-primary'
                                    : 'border-line text-muted hover:text-ink',
                                )}
                              >
                                {sz}
                              </button>
                            )
                          })}
                        </div>
                      </Field>

                      <div className="mt-5 flex flex-col gap-2">
                        <p className="text-[12px] font-bold uppercase tracking-wide text-dim">Starting stock per size</p>
                        {sizes.length === 0 && (
                          <p className="rounded-xl border border-dashed border-line py-6 text-center text-sm text-muted">
                            Pick at least one size above.
                          </p>
                        )}
                        {sizes
                          .slice()
                          .sort((a, b) => SIZE_PRESETS.indexOf(a.size) - SIZE_PRESETS.indexOf(b.size))
                          .map((s) => (
                            <div key={s.size} className="flex items-center gap-3 rounded-xl border border-line bg-bg px-3 py-2.5">
                              <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-sm font-bold text-ink">
                                {s.size}
                              </span>
                              <span className="flex-1 text-[13px] text-muted">Units on hand</span>
                              <input
                                value={s.stock}
                                onChange={(e) =>
                                  setSizes((prev) =>
                                    prev.map((x) => (x.size === s.size ? { ...x, stock: Math.max(0, toInt(e.target.value)) } : x)),
                                  )
                                }
                                inputMode="numeric"
                                className="field h-10 w-24 text-center font-bold"
                              />
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <Field label="Starting stock">
                      <input
                        value={single}
                        onChange={(e) => setSingle(Math.max(0, toInt(e.target.value)))}
                        inputMode="numeric"
                        className="field h-12 max-w-[200px] text-center text-lg font-bold"
                      />
                    </Field>
                  )}

                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-bg/50 p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                      <Layers size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{totalUnits} units · {variantList.length} tags</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        A unique scan tag is generated for every size on the next step. Reorder points can be set later from Inventory.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <QrCode size={18} className="text-primary" />
                        <h3 className="text-base font-bold text-ink">Your scan tags are ready</h3>
                      </div>
                      <p className="mb-4 text-[13px] text-muted">
                        Write each code on a paper tag and stick it on the shirt. Tap a tag to copy it.
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {variantList.map((v, i) => (
                          <button
                            key={v.size}
                            onClick={() => copyCode(codes[i])}
                            className="group flex items-center justify-between rounded-2xl border-2 border-dashed border-line-strong bg-bg p-3.5 text-left transition hover:border-primary/60"
                          >
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-dim">
                                {hasVariant ? `Size ${v.size}` : 'One size'} · {v.stock} units
                              </p>
                              <p className="font-mono text-2xl font-extrabold tracking-[0.12em] text-ink">
                                {codes[i]}
                              </p>
                            </div>
                            <Copy size={18} className="text-dim transition group-hover:text-primary" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* summary */}
                    <div className="rounded-2xl border border-line bg-bg/50 p-4">
                      <div
                        className="grid h-36 place-items-center rounded-xl border border-line"
                        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.05), var(--color-bg))' }}
                      >
                        <Jersey colors={colors} pattern={pattern} number={squadNo ? toInt(squadNo) : undefined} glow className="size-28" />
                      </div>
                      <p className="mt-3 text-base font-bold text-ink">{name || 'New Kit'}</p>
                      <p className="text-[13px] text-muted">{brand} · {kit} · {season}</p>
                      <dl className="mt-3 space-y-1.5 text-[13px]">
                        <Row k="Category" v={category} />
                        <Row k="Retail" v={money(r)} />
                        <Row k="Wholesale" v={money(w)} />
                        <Row k="Total units" v={String(totalUnits)} />
                        <Row k="Tags" v={String(variantList.length)} />
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* footer toolbar — lifted above the mobile bottom-nav */}
      <div className="glass sticky bottom-[70px] z-30 mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-4 py-3 md:bottom-0 md:-mx-4 md:rounded-none md:border-x-0 md:border-b-0 md:border-t lg:-mx-8 lg:px-8">
        <Button
          variant="ghost"
          icon={<Save size={16} />}
          disabled={name.trim().length < 2}
          onClick={() => save('Draft')}
        >
          Save as draft
        </Button>
        <div className="flex items-center gap-2.5">
          {step > 0 && (
            <Button variant="outline" icon={<ArrowLeft size={16} />} onClick={prev}>
              Previous
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="primary" iconRight={<ArrowRight size={16} />} disabled={!canNext} onClick={next}>
              Next
            </Button>
          ) : (
            <Button variant="primary" icon={<Check size={17} />} onClick={() => save('Active')}>
              Save product
            </Button>
          )}
        </div>
      </div>
    </Page>
  )
}

function MarginCard({ title, margin, profit }: { title: string; margin: number; profit: number }) {
  return (
    <div className="rounded-2xl border border-line bg-bg/50 p-4">
      <p className="text-[12.5px] font-semibold text-muted">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-dim">Margin</p>
          <p className={cx('text-2xl font-extrabold', margin >= 0 ? 'text-primary' : 'text-danger')}>
            {Number.isFinite(margin) ? margin : 0}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-dim">Profit / unit</p>
          <p className="text-2xl font-extrabold text-ink">{money(Math.max(0, profit) || 0)}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-dim">{k}</dt>
      <dd className="font-semibold text-ink">{v}</dd>
    </div>
  )
}
