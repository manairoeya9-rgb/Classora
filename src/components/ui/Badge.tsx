import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'coral' | 'sage' | 'gray'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

export function Badge({ children, variant = 'gray', size = 'md', dot = false, className }: BadgeProps) {
  const variants = {
    green:  'badge-green',
    red:    'badge-red',
    yellow: 'badge-yellow',
    blue:   'badge-blue',
    purple: 'badge-purple',
    coral:  'badge-coral',
    sage:   'badge-sage',
    gray:   'badge-gray',
  }
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-semibold rounded-full', variants[variant], sizes[size], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

// ─── Attendance Status Badge ───────────────────────────────────────────────────
const ATTENDANCE_VARIANTS: Record<string, BadgeProps['variant']> = {
  present: 'green', absent: 'red', retard: 'yellow', excuse: 'blue',
}
const ATTENDANCE_LABELS: Record<string, string> = {
  present: 'Présent', absent: 'Absent', retard: 'En retard', excuse: 'Excusé',
}
export function AttendanceBadge({ status }: { status: string }) {
  return (
    <Badge variant={ATTENDANCE_VARIANTS[status] ?? 'gray'} dot>
      {ATTENDANCE_LABELS[status] ?? status}
    </Badge>
  )
}

// ─── Fee Status Badge ──────────────────────────────────────────────────────────
const FEE_VARIANTS: Record<string, BadgeProps['variant']> = {
  paye: 'green', partiel: 'yellow', impaye: 'red',
}
const FEE_LABELS: Record<string, string> = {
  paye: 'Payé', partiel: 'Partiel', impaye: 'Impayé',
}
export function FeeBadge({ status }: { status: string }) {
  return (
    <Badge variant={FEE_VARIANTS[status] ?? 'gray'} dot>
      {FEE_LABELS[status] ?? status}
    </Badge>
  )
}

// ─── Role Badge ────────────────────────────────────────────────────────────────
const ROLE_VARIANTS: Record<string, BadgeProps['variant']> = {
  admin: 'purple', enseignant: 'sage', parent: 'coral', eleve: 'blue', secretariat: 'yellow',
}
const ROLE_LABELS: Record<string, string> = {
  admin: 'Direction', enseignant: 'Enseignant', parent: 'Parent', eleve: 'Élève', secretariat: 'Secrétariat',
}
export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={ROLE_VARIANTS[role] ?? 'gray'}>
      {ROLE_LABELS[role] ?? role}
    </Badge>
  )
}
