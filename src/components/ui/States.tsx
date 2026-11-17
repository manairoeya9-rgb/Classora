import { cn } from '@/lib/utils'

interface LoadingSpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string }
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg className={cn('animate-spin text-[var(--color-forest)]', sizes[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

interface PageLoadingProps { message?: string }
export function PageLoading({ message = 'Chargement…' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-[var(--color-text-muted)]">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium animate-pulse-soft">{message}</p>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}
import React from 'react'
import { Inbox } from 'lucide-react'
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-ivory-dark)] flex items-center justify-center text-[var(--color-text-muted)] mb-1">
        {icon ?? <Inbox size={28} />}
      </div>
      <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
      {description && <p className="text-sm text-[var(--color-text-muted)] max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

interface ErrorStateProps { message?: string; onRetry?: () => void }
import { AlertCircle } from 'lucide-react'
import { Button } from './Button'
export function ErrorState({ message = 'Une erreur est survenue.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 mb-1">
        <AlertCircle size={28} />
      </div>
      <p className="font-medium text-[var(--color-text)]">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Réessayer</Button>}
    </div>
  )
}
