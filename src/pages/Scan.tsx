import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  CameraOff,
  Check,
  CornerDownLeft,
  Flashlight,
  Keyboard,
  ScanLine,
  Sparkles,
  TriangleAlert,
  Undo2,
  X,
  Zap,
} from 'lucide-react'
import { Page } from '../components/Page'
import { Button } from '../components/ui'
import { Jersey } from '../components/Jersey'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import type { CodeMatch, Sale } from '../lib/types'
import { money } from '../lib/format'
import { cx } from '../lib/cx'

type CamState = 'idle' | 'on' | 'denied' | 'unsupported'

export function Scan() {
  const { products, findByCode, sellByCode, undoSale } = useStore()
  const { push } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cam, setCam] = useState<CamState>('idle')
  const [torch, setTorch] = useState(false)

  const [code, setCode] = useState('')
  const [pending, setPending] = useState<CodeMatch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(0)
  const [session, setSession] = useState<Sale[]>([])

  // start camera
  const startCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam('unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCam('on')
    } catch {
      setCam('denied')
    }
  }

  useEffect(() => {
    startCam()
    return () => streamRef.current?.getTracks().forEach((t) => t.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    const next = !torch
    setTorch(next)
    try {
      // works on some mobile devices; harmless elsewhere
      await track?.applyConstraints({ advanced: [{ torch: next } as never] })
    } catch {
      /* fall back to the on-screen brighten only */
    }
  }

  const inStock = useMemo(
    () =>
      products
        .filter((p) => p.status === 'Active')
        .flatMap((p) => p.variants.filter((v) => v.stock > 0).map((v) => v.id)),
    [products],
  )

  const liveMatch = code.trim().length >= 3 ? findByCode(code) : null

  const lookUp = () => {
    const m = findByCode(code)
    if (!m) {
      setPending(null)
      setError('ID not recognised — try again or type it manually.')
      return
    }
    setError(null)
    setPending(m)
  }

  const simulate = () => {
    if (inStock.length === 0) return
    const id = inStock[Math.floor(Math.random() * inStock.length)]
    setCode(id)
    const m = findByCode(id)
    if (m) {
      setError(null)
      setPending(m)
    }
  }

  const confirmSale = () => {
    if (!pending) return
    const res = sellByCode(pending.variant.id)
    if (res.ok && res.sale) {
      setFlash((f) => f + 1)
      setSession((prev) => [res.sale!, ...prev])
      push({
        title: 'Sale logged',
        description: `${res.sale.productName} · ${money(res.sale.price)}`,
        variant: 'success',
        action: { label: 'Undo', onClick: () => undoThis(res.sale!.id) },
      })
      setPending(null)
      setCode('')
      setError(null)
    } else {
      setError('That size is out of stock.')
    }
  }

  const undoThis = (id: string) => {
    undoSale(id)
    setSession((prev) => prev.filter((s) => s.id !== id))
  }

  const sessionUnits = session.reduce((s, x) => s + x.qty, 0)
  const sessionRevenue = session.reduce((s, x) => s + x.qty * x.price, 0)

  return (
    <Page>
      {/* success flash */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, times: [0, 0.2, 1] }}
            onAnimationComplete={() => setFlash(0)}
            className="pointer-events-none fixed inset-0 z-[70] bg-primary/40"
          />
        )}
      </AnimatePresence>

      <div className="mb-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-amber">Point · Confirm · Done</p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink md:text-[32px]">Scan to sell</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* ----------------------- viewfinder ----------------------- */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-black">
          <div className="relative aspect-[4/3] w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cx(
                'absolute inset-0 size-full object-cover transition',
                cam === 'on' ? 'opacity-100' : 'opacity-0',
                torch && 'brightness-150',
              )}
            />

            {/* fallback */}
            {cam !== 'on' && (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-surface to-bg text-center">
                <div className="px-6">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-2 text-dim">
                    {cam === 'denied' ? <CameraOff size={30} /> : <Camera size={30} />}
                  </span>
                  <p className="mt-4 text-base font-bold text-ink">
                    {cam === 'denied'
                      ? 'Camera blocked'
                      : cam === 'unsupported'
                        ? 'No camera here'
                        : 'Starting camera…'}
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">
                    No problem — type the tag below, or hit “Simulate a scan”. The app works fully offline.
                  </p>
                  {cam === 'denied' && (
                    <Button variant="subtle" className="mt-4" icon={<Camera size={15} />} onClick={startCam}>
                      Try camera again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* scanning frame overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.55)_100%)]" />
              <div className="absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2">
                {/* corners */}
                {['left-0 top-0 border-l-2 border-t-2 rounded-tl-2xl', 'right-0 top-0 border-r-2 border-t-2 rounded-tr-2xl', 'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-2xl', 'right-0 bottom-0 border-r-2 border-b-2 rounded-br-2xl'].map((c) => (
                  <span key={c} className={cx('absolute size-9 border-primary', c)} />
                ))}
                {/* scan line */}
                {cam === 'on' && !pending && (
                  <span className="absolute inset-x-3 h-0.5 rounded-full bg-primary shadow-[0_0_18px_4px_rgba(43,212,110,0.7)] animate-scanline" />
                )}
              </div>
              <p className="absolute inset-x-0 bottom-4 text-center text-[12px] font-medium text-white/70">
                Align the handwritten tag inside the frame
              </p>
            </div>

            {/* top controls */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className={cx('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur', cam === 'on' ? 'bg-primary/20 text-primary' : 'bg-black/40 text-white/70')}>
                <span className={cx('size-1.5 rounded-full', cam === 'on' ? 'bg-primary' : 'bg-white/50', cam === 'on' && 'animate-pulse')} />
                {cam === 'on' ? 'Live' : 'Offline'}
              </span>
            </div>
            {cam === 'on' && (
              <button
                onClick={toggleTorch}
                className={cx(
                  'absolute right-3 top-3 grid size-10 place-items-center rounded-full backdrop-blur transition',
                  torch ? 'bg-amber text-amber-ink' : 'bg-black/40 text-white/80 hover:bg-black/60',
                )}
                aria-label="Torch"
              >
                <Flashlight size={18} />
              </button>
            )}
          </div>

          {/* confirmation card */}
          <AnimatePresence>
            {pending && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                className="absolute inset-x-0 bottom-0 z-10"
              >
                <div className="glass m-2.5 rounded-2xl border border-primary/30 p-3.5 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.7)]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-line bg-bg">
                      <Jersey colors={pending.product.colors} pattern={pending.product.pattern} number={pending.product.number} className="size-11" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-ink">
                        {pending.product.name} · {pending.variant.size}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[13px]">
                        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] font-bold text-primary">
                          {pending.variant.id}
                        </code>
                        <span className={cx('font-semibold', pending.variant.stock < 5 ? 'text-amber' : 'text-muted')}>
                          {pending.variant.stock} in stock
                        </span>
                        <span className="font-bold text-ink">{money(pending.product.retail)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_1.6fr] gap-2.5">
                    <Button variant="subtle" icon={<X size={16} />} onClick={() => setPending(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="amber"
                      icon={<Check size={18} strokeWidth={3} />}
                      disabled={pending.variant.stock <= 0}
                      onClick={confirmSale}
                    >
                      {pending.variant.stock <= 0 ? 'Out of stock' : 'Confirm sale'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ----------------------- side panel ----------------------- */}
        <div className="flex flex-col gap-4">
          {/* manual entry */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <Keyboard size={16} className="text-primary" /> Type the tag
            </div>
            <div className="relative">
              <ScanLine size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && lookUp()}
                placeholder="e.g. AR-L-01"
                className="field h-14 pl-11 pr-12 font-mono text-lg font-bold tracking-widest"
              />
              <button
                onClick={lookUp}
                className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg bg-primary text-primary-ink transition hover:bg-primary-bright"
                aria-label="Look up"
              >
                <CornerDownLeft size={18} />
              </button>
            </div>

            {/* live hint */}
            <div className="mt-2 min-h-[20px] text-[13px]">
              {error ? (
                <span className="flex items-center gap-1.5 font-medium text-danger">
                  <TriangleAlert size={14} /> {error}
                </span>
              ) : liveMatch ? (
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Check size={14} /> {liveMatch.product.name} · {liveMatch.variant.size}
                </span>
              ) : (
                <span className="text-dim">Tags are 6–7 characters, like AR-L-01.</span>
              )}
            </div>

            <button
              onClick={simulate}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-2.5 text-[13px] font-semibold text-muted transition hover:border-primary/50 hover:text-primary"
            >
              <Sparkles size={15} /> Simulate a scan
            </button>

            {/* quick picks */}
            {inStock.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-dim">Quick pick</p>
                <div className="flex flex-wrap gap-1.5">
                  {inStock.slice(0, 6).map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setCode(id)
                        const m = findByCode(id)
                        if (m) {
                          setPending(m)
                          setError(null)
                        }
                      }}
                      className="rounded-lg border border-line bg-bg px-2 py-1 font-mono text-[12px] font-bold text-muted transition hover:border-primary/50 hover:text-primary"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* session */}
          <div className="card flex-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <Zap size={16} className="text-amber" /> This session
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-ink">{money(sessionRevenue)}</span>
                <span className="ml-1.5 text-[12px] text-dim">· {sessionUnits} sold</span>
              </div>
            </div>

            {session.length === 0 ? (
              <div className="grid place-items-center py-8 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-dim">
                  <ScanLine size={22} />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">No sales yet</p>
                <p className="mt-0.5 text-[13px] text-muted">Confirm a scan and it’ll appear here.</p>
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {session.map((s) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 py-2.5 first:pt-0"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{s.productName}</p>
                      <p className="font-mono text-[11px] text-dim">{s.code}</p>
                    </div>
                    <span className="text-[13px] font-bold text-ink">{money(s.price)}</span>
                    <button
                      onClick={() => undoThis(s.id)}
                      className="grid size-7 place-items-center rounded-lg text-dim transition hover:bg-surface-2 hover:text-ink"
                      aria-label="Undo"
                    >
                      <Undo2 size={14} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}
