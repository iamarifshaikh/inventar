import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  Info,
  TriangleAlert,
  Undo2,
  XCircle,
  X,
} from 'lucide-react'

type Variant = 'success' | 'error' | 'info' | 'warning'

interface ToastInput {
  title: string
  description?: string
  variant?: Variant
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastItem extends ToastInput {
  id: number
}

interface ToastCtx {
  push: (t: ToastInput) => void
}

const Ctx = createContext<ToastCtx | null>(null)

const META: Record<Variant, { icon: typeof Info; color: string; ring: string }> = {
  success: { icon: CheckCircle2, color: 'var(--color-primary)', ring: 'rgba(43,212,110,0.35)' },
  error: { icon: XCircle, color: 'var(--color-danger)', ring: 'rgba(241,84,63,0.4)' },
  info: { icon: Info, color: 'var(--color-sky)', ring: 'rgba(87,176,255,0.35)' },
  warning: { icon: TriangleAlert, color: 'var(--color-amber)', ring: 'rgba(246,166,35,0.4)' },
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (t: ToastInput) => {
      const id = (counter += 1)
      setItems((prev) => [...prev, { ...t, id }])
      const dur = t.duration ?? 3600
      window.setTimeout(() => remove(id), dur)
    },
    [remove],
  )

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,380px)] flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const meta = META[t.variant ?? 'info']
            const Icon = meta.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="glass pointer-events-auto flex items-start gap-3 rounded-2xl border border-line p-3.5 pr-3 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)]"
                style={{ boxShadow: `0 0 0 1px ${meta.ring}, 0 18px 50px -12px rgba(0,0,0,0.7)` }}
              >
                <span
                  className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
                >
                  <Icon size={18} strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold leading-tight text-ink">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.description}</p>
                  )}
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action!.onClick()
                        remove(t.id)
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink transition hover:bg-surface-3"
                    >
                      <Undo2 size={13} /> {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="grid size-6 shrink-0 place-items-center rounded-lg text-dim transition hover:bg-surface-2 hover:text-ink"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
