import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, hover = false, padding = 'md', className, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[var(--color-border)]',
        'shadow-[var(--shadow-sm)]',
        paddings[padding],
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps { title: string; subtitle?: string; action?: React.ReactNode; icon?: React.ReactNode }
export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--color-sage-light)] flex items-center justify-center text-[var(--color-forest)]">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[var(--color-text)] text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'forest' | 'coral' | 'lavender' | 'yellow' | 'sage'
  trend?: { value: number; label: string }
}

export function StatCard({ title, value, subtitle, icon, color = 'sage', trend }: StatCardProps) {
  const colorMap = {
    forest:   { bg: 'bg-[var(--color-forest)]', icon: 'bg-white/20 text-white', text: 'text-white', sub: 'text-white/70' },
    coral:    { bg: 'bg-[var(--color-coral-light)]', icon: 'bg-[var(--color-coral)] text-white', text: 'text-[var(--color-text)]', sub: 'text-[var(--color-text-muted)]' },
    lavender: { bg: 'bg-[var(--color-lavender)]', icon: 'bg-[var(--color-lavender-dark)] text-white', text: 'text-[var(--color-text)]', sub: 'text-[var(--color-text-muted)]' },
    yellow:   { bg: 'bg-[var(--color-yellow-light)]', icon: 'bg-[var(--color-yellow)] text-[var(--color-forest)]', text: 'text-[var(--color-text)]', sub: 'text-[var(--color-text-muted)]' },
    sage:     { bg: 'bg-[var(--color-sage-light)]', icon: 'bg-[var(--color-sage)] text-[var(--color-forest)]', text: 'text-[var(--color-text)]', sub: 'text-[var(--color-text-muted)]' },
  }
  const c = colorMap[color]
  return (
    <div className={cn('rounded-2xl p-5 border border-[var(--color-border)] card-hover', c.bg)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.icon)}>
          {icon}
        </div>
        {trend && (
          <span className={cn('text-xs font-medium px-2 py-1 rounded-full', trend.value >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className={cn('text-2xl font-bold leading-tight', c.text)}>{value}</p>
      <p className={cn('text-sm font-medium mt-0.5', c.text)}>{title}</p>
      {subtitle && <p className={cn('text-xs mt-1', c.sub)}>{subtitle}</p>}
    </div>
  )
}
