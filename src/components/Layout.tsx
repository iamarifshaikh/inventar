import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  RotateCcw,
  ScanLine,
  Settings,
  Shirt,
  Receipt,
} from 'lucide-react'
import { Logo } from './Logo'
import { Button } from './ui'
import { useStore } from '../store/store'
import { useAuth } from '../store/auth'
import { lowStock, outOfStock } from '../store/selectors'
import { cx } from '../lib/cx'
import { useToast } from './Toast'

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'KR'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Shirt },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/sales', label: 'Sales', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

function NavPill({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      className={({ isActive }) =>
        cx(
          'relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13.5px] font-semibold transition-colors duration-150',
          isActive ? 'text-ink' : 'text-muted hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-xl border border-primary/25 bg-primary/10"
              transition={{ type: 'spring', stiffness: 480, damping: 36 }}
            />
          )}
          <Icon size={16} className={cx('relative z-10', isActive && 'text-primary')} />
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function AvatarMenu() {
  const { resetDemo } = useStore()
  const { user, signOut } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const name = user?.name || 'Kit Room'
  const email = user?.email || 'auv@gofloat.tech'
  const initials = initialsOf(name)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-bright to-amber-deep text-[13px] font-extrabold text-amber-ink shadow-[0_4px_14px_-4px_rgba(246,166,35,0.6)] transition active:scale-95"
        aria-label="Account"
      >
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-12 z-50 w-60 rounded-2xl border border-line p-2 shadow-2xl"
          >
            <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-bright to-amber-deep text-[13px] font-extrabold text-amber-ink">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{name}</p>
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
            </div>
            <div className="my-1.5 h-px bg-line" />
            <button
              onClick={() => {
                resetDemo()
                setOpen(false)
                push({
                  title: 'Demo data restored',
                  description: 'Catalogue and sales reset to the sample set.',
                  variant: 'success',
                })
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <RotateCcw size={15} /> Reset demo data
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
              <Settings size={15} /> Settings
            </button>
            <div className="my-1.5 h-px bg-line" />
            <button
              onClick={() => {
                signOut()
                setOpen(false)
                navigate('/login')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-danger transition hover:bg-danger/10"
            >
              <LogOut size={15} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Layout() {
  const location = useLocation()
  const { products } = useStore()
  const alerts = lowStock(products).length + outOfStock(products).length

  return (
    <div className="relative min-h-screen">
      {/* ------------------------------- header ------------------------------- */}
      <header className="glass sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-8">
          <NavLink to="/dashboard" className="shrink-0">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 rounded-2xl border border-line bg-bg/60 p-1 md:flex">
            {NAV.map((item) => (
              <NavPill key={item.to} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-2.5">
            <NavLink to="/scan" className="hidden sm:block">
              <Button variant="amber" size="sm" icon={<ScanLine size={16} />}>
                Sell
              </Button>
            </NavLink>
            <button className="relative grid size-9 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink">
              <Bell size={17} />
              {alerts > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {alerts}
                </span>
              )}
            </button>
            <AvatarMenu />
          </div>
        </div>
      </header>

      {/* -------------------------------- main -------------------------------- */}
      <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-7 md:pb-12 lg:px-8">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>

      {/* ----------------------------- bottom nav ----------------------------- */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  cx(
                    'flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10.5px] font-semibold transition-colors',
                    isActive ? 'text-primary' : 'text-dim',
                  )
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
