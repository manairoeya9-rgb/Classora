import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export function Button({
  children, variant = 'primary', size = 'md', loading = false,
  icon, iconRight, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-light)] active:scale-[0.98] focus-visible:ring-[var(--color-forest)] shadow-sm',
    secondary: 'bg-[var(--color-sage-light)] text-[var(--color-forest)] hover:bg-[var(--color-sage)] active:scale-[0.98] focus-visible:ring-[var(--color-sage)]',
    ghost:     'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-ivory-dark)] active:scale-[0.98] focus-visible:ring-[var(--color-forest)]',
    danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] focus-visible:ring-red-500 shadow-sm',
    outline:   'bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-ivory-dark)] active:scale-[0.98] focus-visible:ring-[var(--color-forest)]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}
