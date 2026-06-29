import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, LayoutDashboard, ScanLine } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import { Jersey } from '../components/Jersey'
import type { JerseyColors, Pattern } from '../lib/types'

const SQUAD: {
  colors: JerseyColors
  pattern: Pattern
  number: number
  rotate: number
  drop: boolean
}[] = [
  { colors: { body: '#2bd46e', sleeve: '#15a34c', accent: '#04130a' }, pattern: 'solid', number: 4, rotate: -10, drop: false },
  { colors: { body: '#f4f4f4', sleeve: '#f4f4f4', accent: '#131c4b' }, pattern: 'solid', number: 0, rotate: 0, drop: true },
  { colors: { body: '#f6a623', sleeve: '#d6850c', accent: '#1c1102' }, pattern: 'solid', number: 4, rotate: 10, drop: false },
]

export function NotFound() {
  return (
    <div className="relative grid min-h-screen grid-rows-[auto_1fr] overflow-hidden">
      {/* ambient grid + glows */}
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-top opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-[30%] size-[560px] -translate-x-1/2 rounded-full bg-primary/12 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 size-80 rounded-full bg-amber/10 blur-[110px]" />

      {/* top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-5 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/dashboard">
          <Button variant="subtle" size="sm" icon={<LayoutDashboard size={15} />}>
            Dashboard
          </Button>
        </Link>
      </header>

      {/* centre stage */}
      <main className="relative z-10 flex flex-col items-center justify-center px-5 pb-24 text-center">
        {/* the 404 squad */}
        <div className="mb-12 flex items-end justify-center gap-1.5 sm:gap-4">
          {SQUAD.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36, rotate: s.rotate - 8 }}
              animate={{ opacity: 1, y: 0, rotate: s.rotate }}
              transition={{ delay: 0.08 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={s.drop ? 'mb-1 sm:mb-3' : ''}
            >
              <div className="animate-drift" style={{ animationDelay: `${-i * 1.6}s` }}>
                <Jersey
                  colors={s.colors}
                  pattern={s.pattern}
                  number={s.number}
                  glow
                  className="size-24 drop-shadow-2xl sm:size-32 md:size-40"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            Error 404
          </span>
          <h1 className="mt-5 text-balance text-[34px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[48px]">
            This page is off the pitch.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            We can’t find the page you’re after — it may have been moved, sold, or
            never made the squad. Let’s get you back in the game.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="lg" icon={<Home size={18} />}>
                Back to home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="subtle" size="lg" icon={<LayoutDashboard size={18} />}>
                Go to dashboard
              </Button>
            </Link>
          </div>

          <Link
            to="/scan"
            className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted transition hover:text-primary"
          >
            <ScanLine size={15} /> Or jump straight to scan-to-sell
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
