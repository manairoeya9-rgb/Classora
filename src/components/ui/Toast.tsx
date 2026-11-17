import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning'
interface Toast { id: string; type: ToastType; title: string; message?: string }
interface ToastContextValue { toast: (t: Omit<Toast, 'id'>) => void }

type Action =
  | { type: 'ADD'; payload: Toast }
  | { type: 'REMOVE'; id: string }

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

function reducer(state: Toast[], action: Action): Toast[] {
  if (action.type === 'ADD') return [...state, action.payload]
  if (action.type === 'REMOVE') return state.filter(t => t.id !== action.id)
  return state
}

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle }
const COLORS = {
  success: 'border-l-4 border-green-500 bg-white',
  error:   'border-l-4 border-red-500 bg-white',
  info:    'border-l-4 border-blue-500 bg-white',
  warning: 'border-l-4 border-amber-500 bg-white',
}
const ICON_COLORS = { success: 'text-green-500', error: 'text-red-500', info: 'text-blue-500', warning: 'text-amber-500' }

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    dispatch({ type: 'ADD', payload: { ...t, id } })
    setTimeout(() => dispatch({ type: 'REMOVE', id }), 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={cn('rounded-xl shadow-lg p-4 flex items-start gap-3 animate-scale-in', COLORS[t.type])}
            >
              <Icon size={18} className={cn('mt-0.5 flex-shrink-0', ICON_COLORS[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)]">{t.title}</p>
                {t.message && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{t.message}</p>}
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE', id: t.id })}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be within ToastProvider')
  return ctx
}
