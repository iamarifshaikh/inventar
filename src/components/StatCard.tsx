import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cx } from '../lib/cx'

type Tone = 'green' | 'amber' | 'red' | 'sky' | 'violet'

const TONE: Record<Tone, { chip: string; glow: string }> = {
  green: { chip: 'bg-primary/14 text-primary', glow: 'rgba(43,212,110,0.16)' },
  amber: { chip: 'bg-amber/14 text-amber', glow: 'rgba(246,166,35,0.16)' },
  red: { chip: 'bg-danger/14 text-danger', glow: 'rgba(241,84,63,0.16)' },
  sky: { chip: 'bg-sky/14 text-sky', glow: 'rgba(87,176,255,0.16)' },
  violet: { chip: 'bg-violet/14 text-violet', glow: 'rgba(167,139,250,0.16)' },
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'green',
  delta,
  footer,
  index = 0,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: Tone
  delta?: { value: string; up?: boolean }
  footer?: ReactNode
  index?: number
}) {
  const t = TONE[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card group relative overflow-hidden p-5"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: t.glow }}
      />
      <div className="relative flex items-center justify-between">
        <span className={cx('grid size-10 place-items-center rounded-xl', t.chip)}>
          {icon}
        </span>
        {delta && (
          <span
            className={cx(
              'rounded-full px-2 py-0.5 text-[11px] font-bold',
              delta.up ? 'bg-primary/12 text-primary' : 'bg-danger/12 text-danger',
            )}
          >
            {delta.up ? '▲' : '▼'} {delta.value}
          </span>
        )}
      </div>
      <p className="relative mt-4 text-[13px] font-medium text-muted">{label}</p>
      <div className="relative mt-1 text-[30px] font-extrabold leading-none tracking-tight text-ink">
        {value}
      </div>
      {footer && <div className="relative mt-2.5 text-[12.5px] text-dim">{footer}</div>}
    </motion.div>
  )
}
