import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from '../lib/cx'

/* ------------------------------- Button ------------------------------- */

type Variant = 'primary' | 'amber' | 'outline' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  block?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-ink font-bold hover:bg-primary-bright shadow-[0_8px_24px_-8px_rgba(43,212,110,0.65)] hover:shadow-[0_10px_30px_-6px_rgba(43,212,110,0.8)]',
  amber:
    'text-amber-ink font-bold bg-gradient-to-b from-amber-bright to-amber hover:from-amber hover:to-amber-deep shadow-[0_10px_30px_-8px_rgba(246,166,35,0.7)]',
  outline:
    'border border-primary/55 text-primary font-semibold hover:bg-primary/10 hover:border-primary',
  ghost: 'text-muted font-semibold hover:bg-surface-2 hover:text-ink',
  subtle:
    'bg-surface-2 text-ink font-semibold border border-line hover:bg-surface-3 hover:border-line-strong',
  danger:
    'bg-danger/15 text-danger font-semibold border border-danger/30 hover:bg-danger/25',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-[52px] px-7 text-[15px] rounded-2xl gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'subtle', size = 'md', loading, icon, iconRight, block, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        'relative inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        icon && <span className="-ml-0.5 shrink-0">{icon}</span>
      )}
      {children}
      {iconRight && <span className="-mr-0.5 shrink-0">{iconRight}</span>}
    </button>
  )
})

/* ------------------------------- Badge -------------------------------- */

type Tone = 'green' | 'amber' | 'red' | 'neutral' | 'sky' | 'violet'

const TONES: Record<Tone, string> = {
  green: 'bg-primary/12 text-primary border-primary/25',
  amber: 'bg-amber/12 text-amber border-amber/25',
  red: 'bg-danger/12 text-danger border-danger/25',
  neutral: 'bg-surface-2 text-muted border-line',
  sky: 'bg-sky/12 text-sky border-sky/25',
  violet: 'bg-violet/12 text-violet border-violet/25',
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/* -------------------------------- Chip -------------------------------- */

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]',
        active
          ? 'border-primary/50 bg-primary/12 text-primary'
          : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* --------------------------- Segmented control ------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: ReactNode }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-bg p-1',
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-150',
            value === o.value
              ? 'bg-primary text-primary-ink shadow-[0_4px_14px_-4px_rgba(43,212,110,0.6)]'
              : 'text-muted hover:text-ink',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------ StockBar ------------------------------ */

export function stockTone(stock: number, threshold = 5): Tone {
  if (stock <= 0) return 'red'
  if (stock < threshold) return 'amber'
  return 'green'
}

export function StockBar({
  stock,
  cap = 15,
  className,
}: {
  stock: number
  cap?: number
  className?: string
}) {
  const pct = Math.max(stock <= 0 ? 0 : 6, Math.min(100, (stock / cap) * 100))
  const color =
    stock <= 0
      ? 'var(--color-danger)'
      : stock < 5
        ? 'var(--color-amber)'
        : 'var(--color-primary)'
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
