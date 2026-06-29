import { ChevronDown } from 'lucide-react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode
}

export function Select({ icon, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim">
          {icon}
        </span>
      )}
      <select
        className={cx(
          'field h-11 w-full cursor-pointer appearance-none pr-9 text-[13.5px] font-medium',
          icon && 'pl-9',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dim"
      />
    </div>
  )
}
