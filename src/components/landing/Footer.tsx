import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, WifiOff } from 'lucide-react'
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

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto max-w-[1240px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The offline-first kit room. Tag a shirt, scan to sell, and always know
              what’s on the rack — no hardware, no internet required.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:border-line-strong hover:text-ink"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-dim">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) =>
                  l.href.startsWith('/') ? (
                    <li key={l.label}>
                      <Link to={l.href} className="text-[13.5px] text-muted transition hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a href={l.href} className="text-[13.5px] text-muted transition hover:text-ink">
                        {l.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-[13px] text-dim">© {new Date().getFullYear()} inventar. A concept kit-room platform.</p>
          <Badge tone="green" icon={<WifiOff size={11} />}>Works fully offline</Badge>
        </div>
      </div>
    </footer>
  )
}
