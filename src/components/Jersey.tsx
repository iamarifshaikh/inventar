import { useId } from 'react'
import type { JerseyColors, Pattern } from '../lib/types'

interface JerseyProps {
  colors: JerseyColors
  pattern?: Pattern
  number?: number
  showNumber?: boolean
  glow?: boolean
  className?: string
}

/* Jersey silhouette — collar at top, flared hem at bottom. */
const SILHOUETTE =
  'M26 12 L20 13 L4 22 L10 36 L18.5 32 L16.5 58 L47.5 58 L45.5 32 L54 36 L60 22 L44 13 L38 12 C36 17 28 17 26 12 Z'
const LEFT_SLEEVE = 'M20 13 L4 22 L10 36 L18.8 32.2 L21 21 Z'
const RIGHT_SLEEVE = 'M44 13 L60 22 L54 36 L45.2 32.2 L43 21 Z'

function isLight(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
}

export function Jersey({
  colors,
  pattern = 'solid',
  number,
  showNumber = true,
  glow = false,
  className,
}: JerseyProps) {
  const uid = useId().replace(/:/g, '')
  const clip = `clip-${uid}`
  const shade = `shade-${uid}`
  const { body, sleeve, accent } = colors
  const inkOnBody = isLight(body) ? '#0c100e' : 'rgba(255,255,255,0.94)'

  const leftSleeveFill = pattern === 'halves' ? body : sleeve
  const rightSleeveFill = pattern === 'halves' ? accent : sleeve

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      style={glow ? { filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.55))' } : undefined}
    >
      <defs>
        <clipPath id={clip}>
          <path d={SILHOUETTE} />
        </clipPath>
        <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* base body */}
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="64" height="64" fill={body} />

        {pattern === 'stripes' &&
          [6, 14, 22, 30, 38, 46, 54].map((x) => (
            <rect key={x} x={x} y="0" width="4" height="64" fill={accent} />
          ))}

        {pattern === 'hoops' &&
          [14, 24, 34, 44, 54].map((y) => (
            <rect key={y} x="0" y={y} width="64" height="5" fill={accent} />
          ))}

        {pattern === 'halves' && (
          <rect x="32" y="0" width="32" height="64" fill={accent} />
        )}

        {pattern === 'sash' && (
          <>
            <rect x="25.5" y="0" width="13" height="64" fill={accent} />
            <rect x="24" y="0" width="1.6" height="64" fill="#ffffff" />
            <rect x="38.4" y="0" width="1.6" height="64" fill="#ffffff" />
          </>
        )}

        {/* soft depth */}
        <rect x="0" y="0" width="64" height="64" fill={`url(#${shade})`} />
        {/* centre fold */}
        <rect x="31.6" y="16" width="0.8" height="42" fill="#000" opacity="0.08" />
      </g>

      {/* sleeves on top */}
      <path d={LEFT_SLEEVE} fill={leftSleeveFill} />
      <path d={RIGHT_SLEEVE} fill={rightSleeveFill} />

      {/* collar trim */}
      <path
        d="M26 12 C28 17 36 17 38 12"
        fill="none"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* outline for definition on dark bg */}
      <path
        d={SILHOUETTE}
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="0.9"
      />

      {showNumber && number != null && (
        <text
          x="32"
          y="45"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="800"
          fontSize="15"
          fill={inkOnBody}
          opacity="0.92"
        >
          {number}
        </text>
      )}
    </svg>
  )
}
