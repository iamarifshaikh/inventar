import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  WifiOff,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import { Jersey } from '../components/Jersey'
import { useAuth } from '../store/auth'
import { useStore } from '../store/store'
import { useToast } from '../components/Toast'
import { cx } from '../lib/cx'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.2-5.6l-6.6-5.4C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.6 5.4C41.4 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor">
      <path d="M16.36 12.78c.02 2.5 2.19 3.33 2.22 3.34-.02.06-.35 1.2-1.15 2.37-.69 1.02-1.41 2.03-2.55 2.05-1.12.02-1.48-.66-2.76-.66s-1.68.64-2.74.68c-1.1.04-1.94-1.1-2.63-2.11-1.42-2.06-2.5-5.82-1.05-8.36.72-1.26 2.01-2.06 3.41-2.08 1.08-.02 2.1.73 2.76.73.66 0 1.9-.9 3.2-.77.55.02 2.08.22 3.07 1.67-.08.05-1.83 1.07-1.81 3.19zM14.28 5.39c.59-.71.98-1.7.87-2.69-.85.03-1.87.57-2.48 1.28-.54.63-1.02 1.64-.89 2.6.94.08 1.91-.48 2.5-1.19z" />
    </svg>
  )
}

export function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const { user, signIn } = useAuth()
  const { products } = useStore()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // already signed in → straight through
  if (user) return <Navigate to={from} replace />

  const isSignup = mode === 'signup'

  const complete = (u: { name: string; email: string; guest?: boolean }) => {
    signIn(u)
    push({
      title: u.guest ? 'Exploring as guest' : isSignup ? `Welcome, ${u.name}!` : 'Welcome back!',
      description: 'Your kit room is ready.',
      variant: 'success',
    })
    navigate(from, { replace: true })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return setError('Please enter your email address.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('That email doesn’t look right.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (isSignup && !name.trim()) return setError('Tell us your name.')
    setError(null)
    setBusy(true)
    setTimeout(() => complete({ name: name.trim() || email.split('@')[0], email: email.trim() }), 650)
  }

  // a few jerseys for the brand panel collage
  const collage = ['Brazil Home', 'FC Barcelona Home', 'Arsenal Home', 'Newcastle United Home']
    .map((n) => products.find((p) => p.name === n))
    .filter(Boolean)

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* ----------------------- brand panel ----------------------- */}
      <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -left-20 top-10 size-96 rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-amber/10 blur-[120px]" />

        <Link to="/" className="relative w-fit">
          <Logo />
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink">
            Run your kit room like a top-flight club.
          </h2>
          <ul className="mt-7 space-y-3.5">
            {[
              'Tag, scan and sell in seconds — fully offline',
              'Live stock, low-stock alerts and valuation',
              'Auto-generated codes for every size',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] text-muted">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check size={14} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* jersey collage */}
          <div className="mt-10 flex items-end gap-3">
            {collage.map((p, i) => (
              <motion.div
                key={p!.uid}
                initial={{ opacity: 0, y: 24, rotate: -6 + i * 4 }}
                animate={{ opacity: 1, y: 0, rotate: -6 + i * 4 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cx('rounded-2xl border border-line bg-surface/70 p-3 backdrop-blur', i % 2 ? 'mb-5' : '')}
              >
                <Jersey colors={p!.colors} pattern={p!.pattern} number={p!.number} className="size-14" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[13px] text-dim">
          <ShieldCheck size={15} className="text-primary" />
          A concept platform · your data stays on your device
        </div>
      </aside>

      {/* ------------------------- form ------------------------- */}
      <main className="relative flex items-center justify-center px-5 py-10">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[400px]"
        >
          <Link to="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>

          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isSignup
              ? 'Start tracking kits in under a minute.'
              : 'Sign in to pick up where you left off.'}
          </p>

          {/* social */}
          <div className="mt-7 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => complete({ name: 'Alex Morgan', email: 'alex@kitroom.co' })}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-[13.5px] font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2"
            >
              <GoogleMark /> Google
            </button>
            <button
              onClick={() => complete({ name: 'Alex Morgan', email: 'alex@kitroom.co' })}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-[13.5px] font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2"
            >
              <AppleMark /> Apple
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[12px] text-dim">
            <span className="h-px flex-1 bg-line" /> or {isSignup ? 'sign up' : 'sign in'} with email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {isSignup && (
              <Labelled label="Full name">
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="field h-12 pl-10"
                  />
                </div>
              </Labelled>
            )}

            <Labelled label="Email">
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kitroom.co"
                  className="field h-12 pl-10"
                />
              </div>
            </Labelled>

            <Labelled
              label="Password"
              aside={
                !isSignup && (
                  <button type="button" className="text-[12.5px] font-semibold text-primary hover:underline">
                    Forgot?
                  </button>
                )
              }
            >
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="field h-12 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim transition hover:text-ink"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Labelled>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] font-medium text-danger">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" block loading={busy} iconRight={!busy ? <ArrowRight size={18} /> : undefined}>
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <button
            onClick={() => complete({ name: 'Guest', email: 'guest@kitroom.co', guest: true })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-2.5 text-[13.5px] font-semibold text-muted transition hover:border-primary/50 hover:text-primary"
          >
            <WifiOff size={15} /> Continue as guest
          </button>

          <p className="mt-6 text-center text-[13.5px] text-muted">
            {isSignup ? 'Already have an account?' : 'New to inventar?'}{' '}
            <Link
              to={isSignup ? '/login' : '/signup'}
              state={location.state}
              className="font-semibold text-primary hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </Link>
          </p>

          <p className="mt-6 text-center text-[11.5px] leading-relaxed text-dim">
            By continuing you agree to our <span className="underline">Terms</span> and{' '}
            <span className="underline">Privacy Policy</span>. This is a concept demo —
            any email and a 6+ character password will do.
          </p>
        </motion.div>
      </main>
    </div>
  )
}

function Labelled({
  label,
  aside,
  children,
}: {
  label: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-muted">{label}</span>
        {aside}
      </span>
      {children}
    </label>
  )
}
