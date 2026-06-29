import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '../lib/types'
import { Jersey } from './Jersey'
import { Badge } from './ui'
import { money } from '../lib/format'
import { stockSummary } from './ProductRow'
import { cx } from '../lib/cx'

const STATUS_TONE = {
  Active: 'green',
  Draft: 'amber',
  Inactive: 'neutral',
} as const

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: () => void
}) {
  const { units, hasOut, hasLow } = stockSummary(product)

  return (
    <motion.button
      layout
      onClick={onOpen}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="card group flex flex-col p-4 text-left"
    >
      <div className="flex items-center justify-between">
        <Badge tone={STATUS_TONE[product.status]}>{product.status}</Badge>
        <Badge tone="neutral">{product.kit}</Badge>
      </div>

      <div
        className="relative mt-3 grid h-36 place-items-center rounded-xl border border-line"
        style={{ background: 'radial-gradient(circle at 50% 28%, rgba(255,255,255,0.05), var(--color-bg))' }}
      >
        <Jersey
          colors={product.colors}
          pattern={product.pattern}
          number={product.number}
          glow
          className="size-28 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3.5 min-w-0">
        <p className="truncate text-[15px] font-bold text-ink">{product.name}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-muted">
          {product.brand} · {product.category}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {product.variants.map((v) => (
          <span
            key={v.id}
            className={cx(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold',
              v.stock === 0
                ? 'border-danger/25 bg-danger/10 text-danger'
                : v.stock < 5
                  ? 'border-amber/25 bg-amber/10 text-amber'
                  : 'border-line bg-surface-2 text-muted',
            )}
          >
            {v.size}
            <span className="tnum opacity-70">{v.stock}</span>
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-dim">Retail</p>
          <p className="text-lg font-extrabold text-ink">{money(product.retail)}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
          <span className={cx('size-1.5 rounded-full', hasOut ? 'bg-danger' : hasLow ? 'bg-amber' : 'bg-primary')} />
          {units} units
          <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </motion.button>
  )
}
