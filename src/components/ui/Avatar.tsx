import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

// Deterministic color from name
function nameToColor(name: string): string {
  const colors = [
    'bg-[var(--color-coral)] text-white',
    'bg-[var(--color-forest)] text-white',
    'bg-[var(--color-lavender-dark)] text-white',
    'bg-amber-400 text-white',
    'bg-blue-400 text-white',
    'bg-rose-400 text-white',
    'bg-teal-500 text-white',
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', SIZES[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', SIZES[size], nameToColor(name), className)}>
      {getInitials(name)}
    </div>
  )
}
