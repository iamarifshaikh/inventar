import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter, WifiOff } from 'lucide-react'
import { Logo } from '../Logo'
import { Badge } from '../ui'

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Features', href: '#features' },
      { label: 'Live demo', href: '#showcase' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'App',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Inventory', href: '/inventory' },
      { label: 'Scan to sell', href: '/scan' },
      { label: 'Reports', href: '/reports' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Stories', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
]

const SOCIALS = [Twitter, Github, Linkedin]

const linkCls =
  'inline-block text-[13px] text-muted transition-colors duration-150 hover:text-primary'

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden">
      {/* luminous hairline + glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />

      <div className="relative mx-auto max-w-[1240px] px-4 pt-12 lg:px-8">
        <div className="grid gap-9 md:grid-cols-[1.15fr_1.6fr] md:gap-12">
          {/* brand */}
          <div>
            <Logo />
            <p className="mt-3.5 max-w-[15rem] text-[13px] leading-relaxed text-muted">
              The offline-first kit room. Tag a shirt, scan to sell, always know
              what’s on the rack.
            </p>
            <div className="mt-4">
              <Badge tone="green" icon={<WifiOff size={11} />}>
                Works fully offline
              </Badge>
            </div>
          </div>

          {/* links — 3-up even on phones, so the footer stays short */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-dim">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith('/') ? (
                        <Link to={l.href} className={linkCls}>
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className={linkCls}>
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-line py-5 sm:flex-row">
          <p className="text-center text-[12px] text-dim sm:text-left">
            © {new Date().getFullYear()} inventar — a concept kit-room platform.
          </p>
          <div className="flex items-center gap-1.5">
            {SOCIALS.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="grid size-8 place-items-center rounded-lg border border-line text-dim transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* ghost wordmark — bleeds off the bottom edge */}
        <div aria-hidden className="pointer-events-none select-none">
          <span
            className="-mb-[0.16em] block bg-gradient-to-b from-line-strong to-transparent bg-clip-text text-center font-extrabold leading-[0.82] tracking-tighter text-transparent"
            style={{ fontSize: 'clamp(3.25rem, 15vw, 9.5rem)' }}
          >
            inventar
          </span>
        </div>
      </div>
    </footer>
  )
}
