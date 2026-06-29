export const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

export const gbp2 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const num = new Intl.NumberFormat('en-GB')

export function money(n: number): string {
  return Number.isInteger(n) ? gbp.format(n) : gbp2.format(n)
}

const DAY = 86_400_000

export function startOfToday(now = Date.now()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfWeek(now = Date.now()): number {
  const d = new Date(now)
  const day = (d.getDay() + 6) % 7 // Monday-first
  d.setHours(0, 0, 0, 0)
  return d.getTime() - day * DAY
}

export function relativeTime(ts: number, now = Date.now()): string {
  const diff = now - ts
  if (diff < 45_000) return 'just now'
  const mins = Math.round(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(diff / 3_600_000)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(diff / DAY)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fullDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** clamp + tidy a number coming from a text input */
export function toInt(v: string | number, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}
