interface LogoProps {
  className?: string
  showWord?: boolean
}

export function Logo({ className, showWord = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-[0_6px_18px_-4px_rgba(43,212,110,0.6)]">
        <svg viewBox="0 0 64 64" className="size-6">
          <path
            d="M26 12 L20 13 L7 21 L11 33 L18.5 30 L18.5 50 L45.5 50 L45.5 30 L53 33 L57 21 L44 13 L38 12 C36 17 28 17 26 12 Z"
            fill="#04130a"
          />
          <path
            d="M26 12 C28 17 36 17 38 12"
            fill="none"
            stroke="#04130a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWord && (
        <div className="leading-none">
          <span className="text-[17px] font-extrabold tracking-tight text-ink">
            inventar
          </span>
          <span className="ml-1 text-[17px] font-light text-muted">·</span>
          <span className="ml-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
            kit
          </span>
        </div>
      )}
    </div>
  )
}
