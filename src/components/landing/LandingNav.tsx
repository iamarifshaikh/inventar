import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui'
import { cx } from '../../lib/cx'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Live demo' },
  { href: '#pricing', label: 'Pricing' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-line py-2.5' : 'border-b border-transparent py-4',
      )}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 lg:px-8">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-[13.5px] font-semibold text-muted transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link to="/dashboard" className="hidden sm:block">
            <Button variant="primary" size="sm" iconRight={<ArrowRight size={15} />}>
              Open the app
            </Button>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      {open && (
        <div className="glass mx-4 mt-2 rounded-2xl border border-line p-2 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <Link to="/dashboard" className="mt-1 block">
            <Button variant="primary" block iconRight={<ArrowRight size={16} />}>
              Open the app
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
