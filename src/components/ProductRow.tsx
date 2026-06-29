import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Copy,
  Minus,
  Plus,
  Tag,
  Zap,
} from 'lucide-react'
import type { Product } from '../lib/types'
import { Jersey } from './Jersey'
import { Badge, Button, StockBar, stockTone } from './ui'
import { useStore } from '../store/store'
import { useToast } from './Toast'
import { unitsFor } from '../store/selectors'
import { money } from '../lib/format'
import { cx } from '../lib/cx'

export function stockSummary(p: Product) {
  const units = unitsFor(p)
  const hasOut = p.variants.some((v) => v.stock === 0)
  const hasLow = p.variants.some((v) => v.stock > 0 && v.stock < 5)
  return { units, hasOut, hasLow }
}

function useCopyId() {
  const { push } = useToast()
  return (code: string) => {
    navigator.clipboard?.writeText(code).then(
      () =>
        push({
          title: 'Tag copied',
          description: `Write “${code}” on the shirt’s paper tag.`,
          variant: 'success',
        }),
      () => push({ title: 'Copy failed', variant: 'error' }),
    )
  }
}

const STATUS_TONE = {
  Active: 'green',
  Draft: 'amber',
  Inactive: 'neutral',
} as const

export function ProductRow({
  product,
  expanded,
  onToggle,
}: {
  product: Product
  expanded: boolean
  onToggle: () => void
}) {
  const { adjustStock, sellByCode, undoSale } = useStore()
  const { push } = useToast()
  const copyId = useCopyId()
  const { units, hasOut, hasLow } = stockSummary(product)

  const sell = (code: string, name: string) => {
    const res = sellByCode(code)
    if (res.ok && res.sale) {
      push({
        title: 'Sale logged',
        description: `${name} · ${money(res.sale.price)}`,
        variant: 'success',
        action: { label: 'Undo', onClick: () => undoSale(res.sale!.id) },
      })
    } else {
      push({ title: 'Out of stock', description: name, variant: 'error' })
    }
  }

  return (
    <div
      className={cx(
        'overflow-hidden rounded-2xl border bg-surface transition-colors',
        expanded ? 'border-primary/30' : 'border-line hover:border-line-strong',
      )}
    >
      {/* ---------- collapsed header ---------- */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-3 text-left focus-visible:outline-none"
      >
        <span
          className="grid size-14 shrink-0 place-items-center rounded-xl border border-line"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.04), var(--color-bg))' }}
        >
          <Jersey colors={product.colors} pattern={product.pattern} number={product.number} className="size-11" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-ink">{product.name}</p>
            <span className="hidden text-[12px] text-dim sm:inline">· {product.season}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="green">{product.variants.length} sizes</Badge>
            <Badge tone="neutral">{product.kit}</Badge>
            <span className="hidden items-center gap-1 text-[12px] text-muted md:inline-flex">
              {product.brand} · {product.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
              <span className={cx('size-1.5 rounded-full', hasOut ? 'bg-danger' : hasLow ? 'bg-amber' : 'bg-primary')} />
              {units} in stock
              {(hasOut || hasLow) && (
                <span className={cx('font-bold', hasOut ? 'text-danger' : 'text-amber')}>
                  {hasOut ? 'out' : 'low'}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="hidden w-24 shrink-0 text-right md:block">
          <p className="text-[11px] uppercase tracking-wide text-dim">Retail</p>
          <p className="text-sm font-bold text-ink">{money(product.retail)}</p>
        </div>
        <div className="hidden w-24 shrink-0 text-right lg:block">
          <p className="text-[11px] uppercase tracking-wide text-dim">Wholesale</p>
          <p className="text-sm font-bold text-ink">{money(product.wholesale)}</p>
        </div>

        <Badge tone={STATUS_TONE[product.status]} className="hidden xl:inline-flex">
          {product.status}
        </Badge>

        <span
          className={cx(
            'grid size-8 shrink-0 place-items-center rounded-lg text-dim transition-transform duration-300',
            expanded && 'rotate-180 text-primary',
          )}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      {/* ---------- expanded variants ---------- */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-line bg-bg/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 px-1 text-[12px] font-semibold uppercase tracking-wider text-dim">
                <Tag size={13} /> Scan tags &amp; stock
              </div>
              <div className="flex flex-col gap-2">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-surface-2 text-[12px] font-bold text-ink">
                      {v.size}
                    </span>

                    {/* the all-important scan tag */}
                    <button
                      onClick={() => copyId(v.id)}
                      title="Copy tag ID"
                      className="group inline-flex items-center gap-2 rounded-lg border border-dashed border-line-strong bg-bg px-2.5 py-1.5 font-mono text-[14px] font-bold tracking-wider text-ink transition hover:border-primary/60 hover:text-primary"
                    >
                      {v.id}
                      <Copy size={13} className="text-dim transition group-hover:text-primary" />
                    </button>

                    <div className="flex min-w-[120px] flex-1 items-center gap-3">
                      <StockBar stock={v.stock} />
                      <Badge tone={stockTone(v.stock)} className="shrink-0">
                        {v.stock === 0 ? 'Out' : `${v.stock}`}
                      </Badge>
                    </div>

                    {/* stepper */}
                    <div className="inline-flex items-center rounded-lg border border-line bg-bg">
                      <button
                        onClick={() => adjustStock(product.uid, v.id, -1)}
                        className="grid size-8 place-items-center rounded-l-lg text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-40"
                        disabled={v.stock <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="tnum w-9 text-center text-sm font-bold text-ink">{v.stock}</span>
                      <button
                        onClick={() => adjustStock(product.uid, v.id, 1)}
                        className="grid size-8 place-items-center rounded-r-lg text-muted transition hover:bg-surface-2 hover:text-ink"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <Button
                      size="sm"
                      variant="amber"
                      icon={<Zap size={14} />}
                      onClick={() => sell(v.id, `${product.name} · ${v.size}`)}
                      disabled={v.stock <= 0}
                    >
                      Sell
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
