import { useLayoutEffect, useRef, useState } from 'react'

export interface ChartPoint {
  label: string
  value: number
  /** optional short axis label (e.g. weekday) */
  dow?: string
}

interface AreaChartProps {
  data: ChartPoint[]
  height?: number
  color?: string
  format?: (n: number) => string
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver((entries) => {
      setW(entries[0].contentRect.width)
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [w, ref] as const
}

/** Cardinal-spline smoothing → a buttery line through the points. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  const t = 0.18
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function AreaChart({
  data,
  height = 168,
  color = 'var(--color-primary)',
  format = (n) => String(Math.round(n)),
}: AreaChartProps) {
  const [w, ref] = useWidth()
  const [hover, setHover] = useState<number | null>(null)

  const padX = 6
  const padTop = 16
  const padBottom = 26
  const innerW = Math.max(0, w - padX * 2)
  const innerH = height - padTop - padBottom
  const max = Math.max(1, ...data.map((d) => d.value))

  const pts = data.map((d, i) => ({
    x: padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: padTop + innerH - (d.value / max) * innerH,
  }))

  const line = smoothPath(pts)
  const area =
    pts.length > 1
      ? `${line} L ${pts[pts.length - 1].x} ${padTop + innerH} L ${pts[0].x} ${padTop + innerH} Z`
      : ''

  const onMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = innerW <= 0 ? 0 : (x - padX) / innerW
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1))))
    setHover(idx)
  }

  return (
    <div
      ref={ref}
      className="relative select-none"
      style={{ height }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      {w > 0 && (
        <svg width={w} height={height} className="overflow-visible">
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.34" />
              <stop offset="0.7" stopColor={color} stopOpacity="0.04" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* baseline grid */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={w - padX}
              y1={padTop + innerH * g}
              y2={padTop + innerH * g}
              stroke="var(--color-line)"
              strokeDasharray="2 5"
              strokeOpacity="0.5"
            />
          ))}

          {area && <path d={area} fill="url(#area-grad)" />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* x labels */}
          {pts.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              fontSize="10.5"
              className="tnum"
              fill={hover === i ? 'var(--color-ink)' : 'var(--color-dim)'}
              fontWeight={hover === i ? 700 : 500}
            >
              {data[i].dow ?? data[i].label}
            </text>
          ))}

          {/* hover marker */}
          {hover != null && pts[hover] && (
            <>
              <line
                x1={pts[hover].x}
                x2={pts[hover].x}
                y1={padTop - 6}
                y2={padTop + innerH}
                stroke={color}
                strokeOpacity="0.35"
              />
              <circle cx={pts[hover].x} cy={pts[hover].y} r="9" fill={color} fillOpacity="0.18" />
              <circle
                cx={pts[hover].x}
                cy={pts[hover].y}
                r="4.5"
                fill="var(--color-bg)"
                stroke={color}
                strokeWidth="2.5"
              />
            </>
          )}
        </svg>
      )}

      {/* tooltip */}
      {hover != null && pts[hover] && (
        <div
          className="glass pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border border-line px-2.5 py-1.5 text-center shadow-lg"
          style={{ left: pts[hover].x, top: pts[hover].y - 6 }}
        >
          <div className="text-[13px] font-bold leading-none text-ink">
            {format(data[hover].value)}
          </div>
          <div className="mt-0.5 text-[10px] text-muted">{data[hover].label}</div>
        </div>
      )}
    </div>
  )
}
